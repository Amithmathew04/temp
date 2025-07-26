import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const DroneDataDashboard = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [telemetryData, setTelemetryData] = useState(null);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [serverConnected, setServerConnected] = useState(false);

  // Connect to Flask-SocketIO server
  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setServerConnected(true);
      fetchAvailablePorts();
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setServerConnected(false);
    });

    newSocket.on('telemetry_data', (data) => {
      setTelemetryData(data);
      setConnected(data.connected);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchAvailablePorts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/ports');
      const data = await response.json();
      if (data.success) {
        setAvailablePorts(data.ports);
      }
    } catch (error) {
      console.error('Error fetching ports:', error);
    }
  };

  const connectToPort = async () => {
    if (!selectedPort) return;

    try {
      const response = await fetch('http://localhost:5001/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ port: selectedPort }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Connected to drone');
      } else {
        console.error('Failed to connect:', data.error);
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const disconnectFromPort = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/disconnect', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        console.log('Disconnected from drone');
        setConnected(false);
        setTelemetryData(null);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined) return 'N/A';
    return `${value}${unit}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Drone Telemetry Dashboard</h1>
      
      {/* Connection Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-3 h-3 rounded-full ${serverConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Server: {serverConnected ? 'Connected' : 'Disconnected'}</span>
          
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Drone: {connected ? 'Connected' : 'Disconnected'}</span>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
            className="border rounded px-3 py-2 min-w-[200px]"
            disabled={connected}
          >
            <option value="">Select a port</option>
            {availablePorts.map((port, index) => (
              <option key={index} value={port.device}>
                {port.device} - {port.description}
              </option>
            ))}
          </select>
          
          <button
            onClick={refreshPorts}
            disabled={connected}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Refresh Ports
          </button>
          
          {!connected ? (
            <button
              onClick={connectToPort}
              disabled={!selectedPort || !serverConnected}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnectFromPort}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Data */}
      {telemetryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Attitude */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Attitude</h3>
            <div className="space-y-2">
              <div>Roll: {formatValue(telemetryData.attitude?.roll, '°')}</div>
              <div>Pitch: {formatValue(telemetryData.attitude?.pitch, '°')}</div>
              <div>Yaw: {formatValue(telemetryData.attitude?.yaw, '°')}</div>
            </div>
          </div>

          {/* Angular Rates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Angular Rates</h3>
            <div className="space-y-2">
              <div>Roll Rate: {formatValue(telemetryData.angular_rates?.omega_x, '°/s')}</div>
              <div>Pitch Rate: {formatValue(telemetryData.angular_rates?.omega_y, '°/s')}</div>
              <div>Yaw Rate: {formatValue(telemetryData.angular_rates?.omega_z, '°/s')}</div>
            </div>
          </div>

          {/* Position */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Position (Local NED)</h3>
            <div className="space-y-2">
              <div>X: {formatValue(telemetryData.position?.x, ' m')}</div>
              <div>Y: {formatValue(telemetryData.position?.y, ' m')}</div>
              <div>Z: {formatValue(telemetryData.position?.z, ' m')}</div>
            </div>
          </div>

          {/* Velocity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Velocity</h3>
            <div className="space-y-2">
              <div>Vx: {formatValue(telemetryData.velocity?.vx, ' m/s')}</div>
              <div>Vy: {formatValue(telemetryData.velocity?.vy, ' m/s')}</div>
              <div>Vz: {formatValue(telemetryData.velocity?.vz, ' m/s')}</div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-2">
              <div>Altitude: {formatValue(telemetryData.altitude, ' m')}</div>
              <div>Heading: {formatValue(telemetryData.heading, '°')}</div>
              <div>Battery: {formatValue(telemetryData.battery_voltage, ' V')}</div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Last Update</h3>
            <div className="text-sm text-gray-600">
              {telemetryData.timestamp || 'No data received'}
            </div>
          </div>
        </div>
      )}

      {!connected && (
        <div className="text-center py-12 text-gray-500">
          Connect to a drone to view telemetry data
        </div>
      )}
    </div>
  );

  function refreshPorts() {
    fetchAvailablePorts();
  }
};

export default DroneDataDashboard;
