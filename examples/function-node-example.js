/**
 * n8n Function Node Example for AWS WebSocket API
 *
 * This code can be used in a Function node to send messages to AWS API Gateway WebSocket connections.
 *
 * Prerequisites:
 * 1. Install the required AWS SDK packages in your n8n environment:
 *    - @aws-sdk/client-apigatewaymanagementapi
 *    - @aws-sdk/credential-provider-ini
 *
 * 2. Configure your AWS credentials in n8n or use environment variables.
 */

// Import required AWS SDK modules
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} = require("@aws-sdk/client-apigatewaymanagementapi");
const { fromIni } = require("@aws-sdk/credential-provider-ini");

// Configuration
const endpoint = "https://your-api-id.execute-api.region.amazonaws.com/stage";
const connectionId = $json.connectionId; // Get from input
const message = $json.message; // Get from input

// Initialize AWS API Gateway Management API client
// Option 1: Using AWS profile
const apigatewayClient = new ApiGatewayManagementApiClient({
  endpoint,
  credentials: fromIni({ profile: 'default' }),
});

// Option 2: Using access keys directly
/*
const apigatewayClient = new ApiGatewayManagementApiClient({
  endpoint,
  region: "us-east-1", // Replace with your region
  credentials: {
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  },
});
*/

// Function to send message to WebSocket connection
async function send() {
  try {
    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(message),
    });
    await apigatewayClient.send(command);
    return { success: true, connectionId, message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Execute the function and return the result
return send();
