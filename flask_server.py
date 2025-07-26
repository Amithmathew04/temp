from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import serial.tools.list_ports
from pymavlink import mavutil
import time
import threading
import json
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app, origins="*")  # Allow React frontend to connect
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables to store current telemetry data
current_data = {
    "timestamp": None,
    "attitude": {
        "roll": None,
        "pitch": None, 
        "yaw": None
    },
    "angular_rates": {
        "omega_x": None,
        "omega_y": None,
        "omega_z": None
    },
    "position": {
        "x": None,
        "y": None,
        "z": None
    },
    "velocity": {
        "vx": None,
        "vy": None,
        "vz": None
    },
    "altitude": None,
    "heading": None,
    "battery_voltage": None,
    "connected": False
}

mavlink_master = None
data_thread = None
is_running = False

def list_serial_ports():
    """Get list of available serial ports"""
    ports = list(serial.tools.list_ports.comports())
    return [{"device": port.device, "description": port.description} for port in ports]

def connect_to_cube(port_name):
    """Connect to Cube+ autopilot"""
    global mavlink_master
    print(f"Connecting to Cube+ on {port_name}...")
    try:
        mavlink_master = mavutil.mavlink_connection(port_name, baud=57600)
        mavlink_master.wait_heartbeat()
        print(f"Connected to system {mavlink_master.target_system}, component {mavlink_master.target_component}")

        mavlink_master.mav.request_data_stream_send(
            mavlink_master.target_system,
            mavlink_master.target_component,
            mavutil.mavlink.MAV_DATA_STREAM_ALL,
            10,
            1
        )
        current_data["connected"] = True
        return True
    except Exception as e:
        print(f"Failed to connect: {e}")
        current_data["connected"] = False
        return False

def data_collection_thread():
    """Background thread for collecting MAVLink data"""
    global current_data, mavlink_master, is_running
    
    # Initialize variables
    roll = pitch = yaw = None
    omega_x = omega_y = omega_z = None
    x = y = z = None        
    voltage = None
    altitude = None
    vx = vy = vz = None     
    heading = None
    last_emit_time = 0

    try:
        while is_running and mavlink_master:
            msg = mavlink_master.recv_match(blocking=False, timeout=1)
            if not msg:
                continue

            now = time.time()

            # Parse different message types
            if msg.get_type() == "AHRS2":
                roll = msg.roll
                pitch = msg.pitch       
                yaw = msg.yaw
            
            elif msg.get_type() == "ATTITUDE":
                omega_x = msg.rollspeed
                omega_y = msg.pitchspeed
                omega_z = msg.yawspeed

            elif msg.get_type() == "LOCAL_POSITION_NED":
                x = msg.x
                y = msg.y
                z = msg.z
                vx = msg.vx
                vy = msg.vy
                vz = msg.vz
                
            elif msg.get_type() == "RANGEFINDER":
                altitude = msg.distance

            elif msg.get_type() == "SYS_STATUS":
                voltage = msg.voltage_battery / 1000.0  # Convert mV to V

            elif msg.get_type() == "VFR_HUD":
                heading = msg.heading

            # Update current_data and emit to clients every 0.5 seconds
            if now - last_emit_time >= 0.5 and roll is not None:
                last_emit_time = now
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                # Update global data
                current_data.update({
                    "timestamp": timestamp,
                    "attitude": {
                        "roll": round(roll, 3) if roll is not None else None,
                        "pitch": round(pitch, 3) if pitch is not None else None,
                        "yaw": round(yaw, 3) if yaw is not None else None
                    },
                    "angular_rates": {
                        "omega_x": round(omega_x, 3) if omega_x is not None else None,
                        "omega_y": round(omega_y, 3) if omega_y is not None else None,
                        "omega_z": round(omega_z, 3) if omega_z is not None else None
                    },
                    "position": {
                        "x": round(x, 4) if x is not None else None,
                        "y": round(y, 4) if y is not None else None,
                        "z": round(z, 4) if z is not None else None
                    },
                    "velocity": {
                        "vx": round(vx, 4) if vx is not None else None,
                        "vy": round(vy, 4) if vy is not None else None,
                        "vz": round(vz, 4) if vz is not None else None
                    },
                    "altitude": round(altitude, 4) if altitude is not None else None,
                    "heading": round(heading, 3) if heading is not None else None,
                    "battery_voltage": round(voltage, 3) if voltage is not None else None,
                    "connected": True
                })
                
                # Emit data to all connected WebSocket clients
                socketio.emit('telemetry_data', current_data)
                
                print(f"[{timestamp}] Data emitted to clients")

    except Exception as e:
        print(f"Error in data collection thread: {e}")
        current_data["connected"] = False
        socketio.emit('telemetry_data', current_data)

# REST API Endpoints
@app.route('/api/ports', methods=['GET'])
def get_ports():
    """Get available serial ports"""
    try:
        ports = list_serial_ports()
        return jsonify({"success": True, "ports": ports})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/connect', methods=['POST'])
def connect():
    """Connect to specified serial port"""
    global data_thread, is_running
    
    try:
        data = request.get_json()
        port_name = data.get('port')
        
        if not port_name:
            return jsonify({"success": False, "error": "Port name required"}), 400
        
        # Stop existing connection if any
        if is_running:
            is_running = False
            if data_thread:
                data_thread.join(timeout=2)
        
        # Connect to new port
        if connect_to_cube(port_name):
            is_running = True
            data_thread = threading.Thread(target=data_collection_thread)
            data_thread.daemon = True
            data_thread.start()
            
            return jsonify({"success": True, "message": f"Connected to {port_name}"})
        else:
            return jsonify({"success": False, "error": "Failed to connect"}), 500
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/disconnect', methods=['POST'])
def disconnect():
    """Disconnect from current port"""
    global is_running, mavlink_master
    
    try:
        is_running = False
        if mavlink_master:
            mavlink_master.close()
            mavlink_master = None
        
        current_data["connected"] = False
        socketio.emit('telemetry_data', current_data)
        
        return jsonify({"success": True, "message": "Disconnected"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    """Get current telemetry data"""
    return jsonify(current_data)

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get connection status"""
    return jsonify({
        "connected": current_data["connected"],
        "timestamp": current_data["timestamp"]
    })

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('telemetry_data', current_data)

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

@socketio.on('request_data')
def handle_request_data():
    """Handle request for current data"""
    emit('telemetry_data', current_data)

if __name__ == '__main__':
    print("Starting Flask-SocketIO server...")
    print("Server will be available at:")
    print("- HTTP API: http://localhost:5001")
    print("- WebSocket: ws://localhost:5001")
    print("\nAPI Endpoints:")
    print("- GET /api/ports - List available serial ports")
    print("- POST /api/connect - Connect to a port")
    print("- POST /api/disconnect - Disconnect from current port")
    print("- GET /api/telemetry - Get current telemetry data")
    print("- GET /api/status - Get connection status")
    
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
