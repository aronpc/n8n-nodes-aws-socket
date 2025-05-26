// WebSocket Test Client for Testing AWS WebSocket Nodes
// This script connects to the local WebSocket server and can send/receive messages

const WebSocket = require('ws');
const http = require('http');

// Configuration
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';
const MANAGEMENT_URL = process.env.MANAGEMENT_URL || 'http://localhost:3001';

// Store the connection ID
let connectionId = null;

// Connect to the WebSocket server
console.log(`Connecting to WebSocket server at ${WS_URL}...`);
const ws = new WebSocket(WS_URL);

// Handle connection open
ws.on('open', () => {
  console.log('Connected to WebSocket server');
  console.log('Waiting for connection ID...');
});

// Handle messages from the server
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('Received message:', message);

    // Store the connection ID when received
    if (message.type === 'connection_established') {
      connectionId = message.connectionId;
      console.log(`\nConnection ID: ${connectionId}`);
      console.log('\nYou can now:');
      console.log('1. Use this connection ID in the AWS WebSocket node');
      console.log('2. Send a test message to this client using the sendMessage function below');
      console.log('3. Send a message from this client using the following command:');
      console.log('   sendMessage("Hello from client")');
    }
  } catch (error) {
    console.log('Received raw message:', data.toString());
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Handle connection close
ws.on('close', () => {
  console.log('Disconnected from WebSocket server');
});

// Function to send a message to the WebSocket server
function sendMessage(message) {
  if (ws.readyState === WebSocket.OPEN) {
    const messageData = typeof message === 'string' ? message : JSON.stringify(message);
    ws.send(messageData);
    console.log(`Sent message: ${messageData}`);
  } else {
    console.error('WebSocket is not connected');
  }
}

// Function to send a message to a specific connection using the Management API
function sendToConnection(targetConnectionId, message) {
  return new Promise((resolve, reject) => {
    const messageData = typeof message === 'string' ? message : JSON.stringify(message);
    const url = `${MANAGEMENT_URL}/@connections/${targetConnectionId}`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`Message sent to connection ${targetConnectionId}`);
          resolve();
        } else {
          console.error(`Failed to send message: ${res.statusCode} ${responseData}`);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error sending message:', error);
      reject(error);
    });

    req.write(messageData);
    req.end();
  });
}

// Make functions available in the global scope for interactive use
global.sendMessage = sendMessage;
global.sendToConnection = sendToConnection;
global.getConnectionId = () => connectionId;

console.log('\nTest client started. Available commands:');
console.log('- sendMessage(message): Send a message to the WebSocket server');
console.log('- sendToConnection(connectionId, message): Send a message to a specific connection');
console.log('- getConnectionId(): Get the current connection ID');
console.log('\nPress Ctrl+C to exit');
