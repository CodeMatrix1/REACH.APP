const { createServer } = require('http');
const { Server } = require('socket.io');
const { decode } = require('@mapbox/polyline');

// Create an HTTP server
const httpServer = createServer();

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 2000,
  pingInterval: 5000
});

// Store client-to-socket mapping to prevent duplicates
const clientSockets = new Map();
// Store socket-to-incident mapping for cleanup
const socketIncidents = new Map();
// Map to store intervals for each incident to clear them later
const incidentIntervals = new Map();

const decodePolyline = (encoded) => {
  return decode(encoded).map(coords => [coords[0], coords[1]]);
};

const interpolatePoints = (start, end, steps) => {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;
  const deltaLat = (endLat - startLat) / steps;
  const deltaLng = (endLng - startLng) / steps;
  const interpolated = [];
  for (let i = 1; i <= steps; i++) {
    interpolated.push([
      startLat + deltaLat * i,
      startLng + deltaLng * i
    ]);
  }
  return interpolated;
};

// Mock incidents data
const mockIncidents = {
  "45": {
    id: "45",
    event_code: "CVX",
    event_type: "Cardiac Event",
    category: "Medical",
    severity: "high",
    status: "active",
    status_message: "Responders en route",
    reportedAt: new Date(Date.now() - 5 * 60 * 1000),
    address: "1359 North 31st Street, East St. Louis, IL 62204",
    geometry: {
      location: {
        lat: 38.625196855855506,
        lng: -90.115183317234
      }
    },
    responder_location: {
      lat: 38.7,
      lng: -90.2
    },
    assigned: {
      responders: ["WGN-2021"],
      volunteers: {}
    }
  }
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  const clientId = socket.handshake.auth.clientId;
  if (!clientId) {
    console.error('No clientId provided, disconnecting socket:', socket.id);
    socket.disconnect(true);
    return;
  }

  if (clientSockets.has(clientId)) {
    const oldSocket = clientSockets.get(clientId);
    console.log(`Client ${clientId} already has a connection. Disconnecting old socket:`, oldSocket.id);
    const oldIncidentId = socketIncidents.get(oldSocket.id);
    if (oldIncidentId && incidentIntervals.has(oldIncidentId)) {
      clearTimeout(incidentIntervals.get(oldIncidentId));
      incidentIntervals.delete(oldIncidentId);
    }
    oldSocket.disconnect(true);
    socketIncidents.delete(oldSocket.id);
  }
  clientSockets.set(clientId, socket);

  socket.on('joinIncident', async (incidentId) => {
    console.log(`Client ${clientId} joining incident:`, incidentId);
    
    const incident = mockIncidents[incidentId];
    if (!incident) {
      socket.emit('error', 'Incident not found');
      return;
    }

    socket.join(incidentId);
    socketIncidents.set(socket.id, incidentId);

    // Simulate route calculation
    const path = [
      [incident.responder_location.lat, incident.responder_location.lng],
      [38.65, -90.15],
      [38.63, -90.12],
      [incident.geometry.location.lat, incident.geometry.location.lng]
    ];

    socket.emit('incidentData', {
      ...incident,
      routeInfo: {
        distance: "5.2 km",
        duration: "12 mins",
        endAddress: incident.address,
        startAddress: "Responder Location",
        path: path
      }
    });

    // Simulate responder movement
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < path.length - 1) {
        const position = path[currentIndex];
        socket.emit('responderLocationUpdated', position);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    incidentIntervals.set(incidentId, interval);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const incidentId = socketIncidents.get(socket.id);
    if (incidentId && incidentIntervals.has(incidentId)) {
      clearTimeout(incidentIntervals.get(incidentId));
      incidentIntervals.delete(incidentId);
    }
    clientSockets.delete(clientId);
    socketIncidents.delete(socket.id);
  });
});

// Start the server
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
});

// Export the handler for Netlify
exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'Socket server is running' })
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
}; 