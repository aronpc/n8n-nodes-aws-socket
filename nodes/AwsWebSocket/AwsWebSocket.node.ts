import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { fromIni } from '@aws-sdk/credential-provider-ini';

export class AwsWebSocket implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'AWS WebSocket',
    name: 'awsWebSocket',
    icon: 'file:awsWebSocket.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Send messages to AWS API Gateway WebSocket connections',
    defaults: {
      name: 'AWS WebSocket',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'awsWebSocketApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Send Message',
            value: 'sendMessage',
            description: 'Send a message to a WebSocket connection',
            action: 'Send a message to a WebSocket connection',
          },
        ],
        default: 'sendMessage',
      },
      {
        displayName: 'Connection ID',
        name: 'connectionId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendMessage'],
          },
        },
        default: '',
        description: 'The ID of the connection to send the message to',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendMessage'],
          },
        },
        default: '',
        description: 'The message to send to the connection',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials('awsWebSocketApi');

    if (!credentials) {
      throw new NodeOperationError(this.getNode(), 'No credentials provided!');
    }

    const endpoint = credentials.apiGatewayEndpoint as string;

    if (!endpoint) {
      throw new NodeOperationError(this.getNode(), 'API Gateway Endpoint is required!');
    }

    // Initialize AWS API Gateway Management API client
    const apigatewayClient = new ApiGatewayManagementApiClient({
      endpoint,
      region: credentials.awsRegion as string,
      credentials: credentials.awsProfileName
        ? fromIni({ profile: credentials.awsProfileName as string })
        : {
            accessKeyId: credentials.awsAccessKeyId as string,
            secretAccessKey: credentials.awsSecretAccessKey as string,
          },
    });

    // Process each item
    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;

        if (operation === 'sendMessage') {
          const connectionId = this.getNodeParameter('connectionId', i) as string;
          const message = this.getNodeParameter('message', i) as string;

          // Send message to WebSocket connection
          const command = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: Buffer.from(message),
          });

          await apigatewayClient.send(command);

          returnData.push({
            json: {
              success: true,
              connectionId,
              message,
            },
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              success: false,
              error: error.message,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
