# n8n-nodes-aws-websocket

This is an n8n community node that allows you to send messages to AWS API Gateway WebSocket connections.

## Installation

### In n8n Desktop or Self-Hosted

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-aws-websocket` in **Enter npm package name**
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

The AWS WebSocket node has the following configuration options:

- **Operation**: Currently only "Send Message" is supported
- **Connection ID**: The ID of the WebSocket connection to send the message to
- **Message**: The message content to send to the connection

### Example Workflow

Here's an example of how to use the AWS WebSocket node in a workflow:

1. Use a trigger node (e.g., Webhook, Cron) to start the workflow
2. Add the AWS WebSocket node
3. Configure the node with your AWS WebSocket API credentials
4. Set the Connection ID and Message fields
5. Execute the workflow

## Development

If you want to develop and modify this node:

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the node: `npm run build`
4. Link to your n8n installation: `npm link`
5. In your n8n installation directory: `npm link n8n-nodes-aws-websocket`

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [AWS API Gateway WebSocket API Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
