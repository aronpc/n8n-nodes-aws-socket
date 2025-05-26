# Local Testing for AWS WebSocket Nodes

This directory contains scripts for testing the AWS WebSocket nodes locally without requiring an actual AWS API Gateway WebSocket endpoint.

## Prerequisites

- Node.js installed on your machine
- n8n installed locally or in development mode
- This n8n-nodes-websocket-aws package installed in n8n

## Files

- `local-websocket-server.js`: A WebSocket server that simulates AWS API Gateway WebSocket API
- `websocket-test-client.js`: A test client that connects to the WebSocket server and can send/receive messages

## Setup and Testing

### Step 1: Start the Local WebSocket Server

```bash
node test/local-websocket-server.js
```

This will start two servers:
- WebSocket server on port 3000 (simulates the main WebSocket endpoint)
- HTTP server on port 3001 (simulates the AWS API Gateway Management API)

### Step 2: Configure n8n Credentials

1. In n8n, create a new credential of type "AWS WebSocket (API)"
2. Fill in the following values:
   - AWS Access Key ID: `test` (any value will work for local testing)
   - AWS Secret Access Key: `test` (any value will work for local testing)
   - AWS Region: `us-east-1` (any value will work for local testing)
   - API Gateway Endpoint: `http://localhost:3001` (important for the AWS WebSocket node)

### Step 3: Configure the AWS WebSocket Trigger Node

1. Add an "AWS WebSocket Trigger" node to your workflow
2. Configure it with:
   - WebSocket URL: `ws://localhost:3000`
   - Select the credentials you created in Step 2

### Step 4: Configure the AWS WebSocket Node

1. Add an "AWS WebSocket" node to your workflow
2. Configure it with:
   - Operation: Send Message
   - Connection ID: (You'll get this from the test client)
   - Message: Your test message
   - Select the credentials you created in Step 2

### Step 5: Run the Test Client

In a separate terminal, run:

```bash
node test/websocket-test-client.js
```

The client will connect to the WebSocket server and receive a connection ID. You can use this connection ID in the AWS WebSocket node to send messages to this client.

### Step 6: Test the Workflow

1. Activate your workflow with the AWS WebSocket Trigger node
2. The trigger node will connect to your local WebSocket server
3. Use the test client to send messages to the WebSocket server
4. The trigger node will receive these messages and trigger your workflow
5. Use the AWS WebSocket node to send messages back to the test client

## Interactive Testing

The test client provides several functions you can use interactively:

- `sendMessage(message)`: Send a message to the WebSocket server
- `sendToConnection(connectionId, message)`: Send a message to a specific connection
- `getConnectionId()`: Get the current connection ID

Example:
```javascript
// Send a message from the client to the server
sendMessage("Hello from client");

// Send a message to a specific connection
sendToConnection("some-connection-id", "Hello from management API");
```

## Testing with Multiple Clients

You can run multiple instances of the test client to simulate multiple connections. Each client will receive its own connection ID.

## Troubleshooting

- If you encounter connection issues, make sure both servers are running and the ports are not in use
- Check that the WebSocket URL and API Gateway Endpoint are correctly configured
- Verify that the n8n workflow is activated
- Check the console output of both the server and client for error messages
