# n8n-nodes-websocket-aws

This is an n8n community node package that allows you to send messages to and receive messages from AWS API Gateway WebSocket connections.

## Installation

### In n8n Desktop or Self-Hosted

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-websocket-aws` in **Enter npm package name**
4. Click **Install**

### In n8n Cloud

This node needs to be [requested to be added to your n8n Cloud instance](https://docs.n8n.io/integrations/community-nodes/installation/cloud/).

## Usage

### Credentials

Before using the AWS WebSocket node, you need to set up credentials for AWS API Gateway:

1. Go to **Credentials** in the n8n sidebar
2. Click **Create New Credentials**
3. Select **AWS WebSocket API** from the list
4. Fill in the following fields:
   - **AWS Access Key ID**: Your AWS access key
   - **AWS Secret Access Key**: Your AWS secret key
   - **AWS Region**: The AWS region where your API Gateway is deployed (e.g., us-east-1)
   - **AWS Profile Name** (optional): If you're using AWS profiles, specify the profile name
   - **API Gateway Endpoint**: The endpoint URL of your WebSocket API (e.g., https://xxxxx.execute-api.region.amazonaws.com/stage)
5. Click **Save**

### Node Configuration

#### AWS WebSocket Node

The AWS WebSocket node has the following configuration options:

- **Operation**: Currently only "Send Message" is supported
- **Connection ID**: The ID of the WebSocket connection to send the message to
- **Message**: The message content to send to the connection

#### AWS WebSocket Trigger Node

The AWS WebSocket Trigger node allows you to listen for messages from AWS API Gateway WebSocket connections. It has the following configuration options:

- **WebSocket URL**: The WebSocket URL to connect to (e.g., wss://xxxxx.execute-api.region.amazonaws.com/stage)
- **Connection Protocol** (optional): Protocol for the WebSocket connection
- **Headers** (optional): Headers to include in the WebSocket connection request

### Example Workflows

#### AWS WebSocket Node Example

Here's an example of how to use the AWS WebSocket node to send messages:

1. Use a trigger node (e.g., Webhook, Cron) to start the workflow
2. Add the AWS WebSocket node
3. Configure the node with your AWS WebSocket API credentials
4. Set the Connection ID and Message fields
5. Execute the workflow

#### AWS WebSocket Trigger Node Example

Here's an example of how to use the AWS WebSocket Trigger node to receive messages:

1. Add the AWS WebSocket Trigger node as the start of your workflow
2. Configure the node with your AWS WebSocket API credentials
3. Set the WebSocket URL to connect to
4. Add nodes to process the received messages
5. Activate the workflow

Example workflows are available in the `examples` directory:
- `sample-workflow.json`: Example of sending messages with the AWS WebSocket node
- `trigger-workflow-example.json`: Example of receiving messages with the AWS WebSocket Trigger node

## Local Testing

This package includes tools for testing the AWS WebSocket nodes locally without requiring an actual AWS API Gateway WebSocket endpoint.

### Prerequisites

- Node.js installed on your machine
- n8n installed locally or in development mode
- This package installed in n8n

### Testing Steps

1. Start the local WebSocket server:
   ```bash
   node test/local-websocket-server.js
   ```

2. In a separate terminal, run the test client:
   ```bash
   node test/websocket-test-client.js
   ```

3. Configure your n8n workflow:
   - For the AWS WebSocket Trigger node, set the WebSocket URL to `ws://localhost:3000`
   - For the AWS WebSocket node, set the API Gateway Endpoint in credentials to `http://localhost:3001`
   - Use the connection ID provided by the test client

4. Activate your workflow and test the communication between the nodes and the local WebSocket server

For detailed instructions and more information, see the [test/README.md](test/README.md) file.

A sample workflow for local testing is available at `test/sample-local-workflow.json`.

## Development

If you want to develop and modify this package:

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the package: `npm run build`
4. Link to your n8n installation: `npm link`
5. In your n8n installation directory: `npm link n8n-nodes-websocket-aws`

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [AWS API Gateway WebSocket API Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
