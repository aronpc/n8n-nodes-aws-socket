import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
  NodeConnectionType,
  NodeOperationError,
  IDataObject,
} from 'n8n-workflow';

// Import WebSocket as a CommonJS module to ensure it works as a constructor
// @ts-ignore
const WebSocket = require('ws');
import type { ClientOptions, Data } from 'ws';

// Define WebSocket constants
const OPEN = 1; // WebSocket.OPEN constant value

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

    // Safely get required parameters
    let webSocketUrl: string;
    try {
      webSocketUrl = this.getNodeParameter('webSocketUrl') as string;
      if (!webSocketUrl) {
        throw new NodeOperationError(this.getNode(), 'WebSocket URL is required!');
      }
    } catch (error) {
      throw new NodeOperationError(this.getNode(), 'Could not get WebSocket URL parameter!');
    }

    // Protocol is optional
    let protocol = '';
    try {
      if (this.getNode().parameters.protocol !== undefined) {
        protocol = this.getNodeParameter('protocol') as string;
      }
    } catch (error) {
      this.logger.warn('Error getting protocol parameter', { error });
    }

    // Safely get headers.parameters if they exist
    let headersCollection: Array<{ name: string; value: string; }> | undefined;
    try {
      // First check if the headers parameter exists to avoid "Could not get parameter" error
      if (this.getNode().parameters.headers !== undefined) {
        const headers = this.getNodeParameter('headers') as IDataObject;
        if (headers && headers.parameters) {
          headersCollection = headers.parameters as Array<{
            name: string;
            value: string;
          }>;
        }
      }
    } catch (error) {
      // Headers parameter doesn't exist or is not properly configured
      this.logger.warn('Error getting headers parameter', { error });
      headersCollection = undefined;
    }

    // Prepare headers
    const headers: Record<string, string> = {};
    if (headersCollection) {
      for (const header of headersCollection) {
        headers[header.name] = header.value;
      }
    }

    // Create WebSocket connection
    const options: ClientOptions = {
      headers,
    };

    if (protocol) {
      options.protocol = protocol;
    }

    const ws = new WebSocket(webSocketUrl, options);

    // Setup event handlers

    // Function to manually trigger the node
    const manualTriggerFunction = async (): Promise<void> => {
      // This function is intentionally left empty as it's just a placeholder
      // The actual triggering happens through the WebSocket connection
    };

    // This will receive messages from the WebSocket connection
    ws.on('message', (data: Data) => {
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
      if (ws.readyState === OPEN) {
        ws.close();
      }
    }

    // The function that gets called when the workflow gets activated
    async function startFunction() {
      if (ws.readyState !== OPEN) {
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
      if (ws.readyState === OPEN) {
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

    // Call startFunction to ensure it's executed when the trigger is activated
    await startFunction();

    return {
      closeFunction,
      manualTriggerFunction,
    };
  }
}
