# Drone Telemetry Flask Server

This Flask server converts your MAVLink data logger into a real-time web API with WebSocket support for React frontends.

## Features

- **REST API** for connection management and data retrieval
- **WebSocket support** for real-time telemetry streaming
- **CORS enabled** for React frontend compatibility
- **Background data collection** from MAVLink devices
- **CSV logging** (optional)
- **Multiple client support** via WebSocket

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Flask Server

```bash
python flask_server.py
```

The server will be available at:
- **HTTP API**: http://localhost:5000
- **WebSocket**: ws://localhost:5000

## API Endpoints

### GET /api/ports
List available serial ports
```json
{
  "success": true,
  "ports": [
    {
      "device": "/dev/tty.usbserial-0001",
      "description": "USB Serial Port"
    }
  ]
}
```

### POST /api/connect
Connect to a serial port
```json
// Request
{
  "port": "/dev/tty.usbserial-0001"
}

// Response
{
  "success": true,
  "message": "Connected to /dev/tty.usbserial-0001"
}
```

### POST /api/disconnect
Disconnect from current port
```json
{
  "success": true,
  "message": "Disconnected"
}
```

### GET /api/telemetry
Get current telemetry data
```json
{
  "timestamp": "2025-07-26 10:30:45",
  "attitude": {
    "roll": 1.234,
    "pitch": -0.567,
    "yaw": 45.678
  },
  "angular_rates": {
    "omega_x": 0.001,
    "omega_y": -0.002,
    "omega_z": 0.003
  },
  "position": {
    "x": 10.1234,
    "y": -5.6789,
    "z": -2.3456
  },
  "velocity": {
    "vx": 0.5,
    "vy": -0.3,
    "vz": 0.1
  },
  "altitude": 15.678,
  "heading": 90.123,
  "battery_voltage": 12.6,
  "connected": true
}
```

### GET /api/status
Get connection status
```json
{
  "connected": true,
  "timestamp": "2025-07-26 10:30:45"
}
```

## WebSocket Events

### Client → Server
- `connect`: Establish connection
- `disconnect`: Close connection  
- `request_data`: Request current telemetry data

### Server → Client
- `telemetry_data`: Real-time telemetry updates (every 0.5 seconds)

## Frontend Integration

### Option 1: Use the HTML Dashboard (Quick Test)

Open `dashboard.html` in your browser to test the connection immediately.

### Option 2: React Integration

```javascript
import io from 'socket.io-client';

// Connect to WebSocket
const socket = io('http://localhost:5000');

// Listen for telemetry data
socket.on('telemetry_data', (data) => {
  console.log('Received telemetry:', data);
  // Update your React state here
});

// Connect to a serial port
const connectToPort = async (portDevice) => {
  const response = await fetch('http://localhost:5000/api/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ port: portDevice }),
  });
  return response.json();
};
```

### Option 3: Use the React Component

1. Set up a new React project:
```bash
npx create-react-app drone-dashboard
cd drone-dashboard
npm install socket.io-client
```

2. Copy `DroneDataDashboard.jsx` to your `src` directory
3. Import and use the component in your App.js

## Development Setup

### For React Development

1. Install frontend dependencies:
```bash
npm install react react-dom socket.io-client
# If using Tailwind CSS:
npm install -D tailwindcss postcss autoprefixer
```

2. Start your React development server:
```bash
npm start
```

### For Testing

1. Start the Flask server: `python flask_server.py`
2. Open `dashboard.html` in your browser
3. Select a serial port and connect
4. View real-time telemetry data

## Configuration

### Changing Server Port
Edit `flask_server.py`:
```python
socketio.run(app, host='0.0.0.0', port=YOUR_PORT, debug=True)
```

### Adjusting Data Rate
Edit the condition in `data_collection_thread()`:
```python
if now - last_emit_time >= 0.1:  # Change 0.5 to 0.1 for 10Hz updates
```

### Adding CSV Logging
To enable CSV logging, uncomment and modify the CSV writing code in the `data_collection_thread()` function.

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure all dependencies are installed with `pip install -r requirements.txt`

2. **Permission denied on serial port**: 
   - On macOS/Linux: `sudo chmod 666 /dev/ttyUSB0` (replace with your port)
   - On Windows: Run terminal as administrator

3. **CORS errors**: Make sure the Flask server is running and CORS is enabled

4. **WebSocket connection fails**: Check that port 5000 is not blocked by firewall

### Debug Mode

The server runs in debug mode by default. To disable:
```python
socketio.run(app, host='0.0.0.0', port=5000, debug=False)
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cube+ Drone   │────│   Flask Server   │────│  React Frontend │
│   (MAVLink)     │    │  (REST + WS)     │    │   (Dashboard)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
       Serial               HTTP/WebSocket            Browser
```

The Flask server acts as a bridge between your MAVLink device and web frontends, providing both REST API endpoints for control operations and WebSocket streams for real-time data.
