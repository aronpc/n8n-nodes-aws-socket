import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';

import {
  ApiGatewayManagementApiClient,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { fromIni } from '@aws-sdk/credential-provider-ini';
// @ts-ignore
import * as WebSocket from 'ws';

export class AwsWebSocketTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'AWS WebSocket Trigger',
    name: 'awsWebSocketTrigger',
    icon: 'file:awsWebSocket.svg',
    group: ['trigger'],
    version: 1,
    description: 'Listens to messages from AWS API Gateway WebSocket connections',
    defaults: {
      name: 'AWS WebSocket Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'awsWebSocketApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'WebSocket URL',
        name: 'webSocketUrl',
        type: 'string',
        required: true,
        default: '',
        description: 'The WebSocket URL to connect to (wss://xxxxx.execute-api.region.amazonaws.com/stage)',
      },
      {
        displayName: 'Connection Protocol',
        name: 'protocol',
        type: 'string',
        required: false,
        default: '',
        description: 'Optional protocol for the WebSocket connection',
      },
      {
        displayName: 'Headers',
        name: 'headers',
        placeholder: 'Add Header',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        description: 'Optional headers for the WebSocket connection',
        default: {},
        options: [
          {
            name: 'parameters',
            displayName: 'Headers',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the header',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value of the header',
              },
            ],
          },
        ],
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const credentials = await this.getCredentials('awsWebSocketApi');

    if (!credentials) {
      throw new NodeOperationError(this.getNode(), 'No credentials provided!');
    }

    const webSocketUrl = this.getNodeParameter('webSocketUrl') as string;
    const protocol = this.getNodeParameter('protocol') as string;
    const headersCollection = this.getNodeParameter('headers.parameters') as Array<{
      name: string;
      value: string;
    }> | undefined;

    // Prepare headers
    const headers: Record<string, string> = {};
    if (headersCollection) {
      for (const header of headersCollection) {
        headers[header.name] = header.value;
      }
    }

    // Create WebSocket connection
    const options: WebSocket.ClientOptions = {
      headers,
    };

    if (protocol) {
      options.protocol = protocol;
    }

    const ws = new WebSocket(webSocketUrl, options);

    // Setup event handlers
    const manualTriggerEnabled = this.getNodeParameter('manualTrigger', false) as boolean;

    // Function to manually trigger the node
    const manualTriggerFunction = async (): Promise<void> => {
      // This function is intentionally left empty as it's just a placeholder
      // The actual triggering happens through the WebSocket connection
    };

    // This will receive messages from the WebSocket connection
    ws.on('message', (data: WebSocket.Data) => {
      let message: string;

      if (Buffer.isBuffer(data)) {
        message = data.toString();
      } else if (typeof data === 'string') {
        message = data;
      } else {
        message = JSON.stringify(data);
      }

      let parsedData;
      try {
        parsedData = JSON.parse(message);
      } catch (error) {
        parsedData = { message };
      }

      this.emit([[
        {
          json: {
            data: parsedData,
            timestamp: new Date().toISOString(),
          },
        },
      ]]);
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      this.logger.error('WebSocket error occurred', { message: error.message });
    });

    // Handle connection close
    ws.on('close', (code: number, reason: string) => {
      this.logger.info(`WebSocket connection closed: ${code} - ${reason}`);
    });

    // The function that gets called when the workflow gets deactivated
    async function closeFunction() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }

    // The function that gets called when the workflow gets activated
    async function startFunction() {
      if (ws.readyState !== WebSocket.OPEN) {
        return new Promise<void>((resolve, reject) => {
          ws.on('open', () => {
            resolve();
          });

          ws.on('error', (error: Error) => {
            reject(error);
          });
        });
      }
    }

    // Initialize the WebSocket connection when the node is activated
    await new Promise<void>((resolve, reject) => {
      if (ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      ws.on('open', () => {
        resolve();
      });

      ws.on('error', (error: Error) => {
        reject(error);
      });
    });

    return {
      closeFunction,
      manualTriggerFunction,
    };
  }
}
