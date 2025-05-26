// Local WebSocket Server for Testing AWS WebSocket Nodes
// This script creates a WebSocket server that simulates AWS API Gateway WebSocket API
// It can be used to test both the AWS WebSocket and AWS WebSocket Trigger nodes

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 3000;
const MANAGEMENT_PORT = process.env.MANAGEMENT_PORT || 3001;

// Store active connections
const connections = new Map();

// Create WebSocket server (simulates the main WebSocket endpoint)
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Create HTTP server for management API (simulates the AWS API Gateway Management API)
const managementServer = http.createServer();
const managementApp = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Handle POST to connection (simulates PostToConnectionCommand)
  if (parsedUrl.pathname.startsWith('/@connections/')) {
    const connectionId = parsedUrl.pathname.split('/')[2];

    if (req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const connection = connections.get(connectionId);

        if (connection && connection.readyState === WebSocket.OPEN) {
          connection.send(body);
          res.statusCode = 200;
          res.end();
        } else {
          res.statusCode = 410; // Gone - Connection no longer available
          res.end(JSON.stringify({ message: 'Connection not available' }));
        }
      });
    } else {
      res.statusCode = 405; // Method Not Allowed
      res.end();
    }
  } else {
    res.statusCode = 404;
    res.end();
  }
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  // Generate a unique connection ID (simulates AWS API Gateway connection ID)
  const connectionId = generateConnectionId();

  console.log(`New connection established: ${connectionId}`);

  // Store the connection
  connections.set(connectionId, ws);

  // Send the connection ID to the client
  ws.send(JSON.stringify({
    type: 'connection_established',
    connectionId
  }));

  // Handle messages from clients
  ws.on('message', (message) => {
    console.log(`Received message from ${connectionId}: ${message}`);

    // Echo the message back (for testing)
    try {
      const parsedMessage = JSON.parse(message);
      ws.send(JSON.stringify({
        type: 'echo',
        data: parsedMessage,
        connectionId
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'echo',
        data: message.toString(),
        connectionId
      }));
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log(`Connection closed: ${connectionId}`);
    connections.delete(connectionId);
  });
});

// Generate a random connection ID (similar to AWS API Gateway format)
function generateConnectionId() {
  return Buffer.from(Math.random().toString(36).substring(2, 15)).toString('base64');
}

// Start the servers
server.listen(PORT, () => {
  console.log(`WebSocket server running at ws://localhost:${PORT}`);
});

managementServer.listen(MANAGEMENT_PORT, () => {
  console.log(`Management API server running at http://localhost:${MANAGEMENT_PORT}`);
  console.log(`Use this as your API Gateway Endpoint in credentials`);
});

console.log('\nInstructions:');
console.log('1. For AWS WebSocket Trigger node:');
console.log(`   - Set WebSocket URL to: ws://localhost:${PORT}`);
console.log('   - Configure credentials with any values (they won\'t be used)');
console.log('   - Set API Gateway Endpoint to any value (it won\'t be used)');
console.log('\n2. For AWS WebSocket node:');
console.log(`   - Set API Gateway Endpoint to: http://localhost:${MANAGEMENT_PORT}`);
console.log('   - Use the connectionId received from the WebSocket server');
console.log('\n3. To test sending messages:');
console.log('   - Connect to the WebSocket server');
console.log('   - Get the connectionId from the connection_established message');
console.log('   - Use that connectionId in the AWS WebSocket node');
