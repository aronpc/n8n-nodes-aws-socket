import WebSocket from 'ws';
import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';

export class WebSocketTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'WebSocket Trigger',
    name: 'webSocketTrigger',
    icon: 'fa:exchange-alt',
    group: ['trigger'],
    version: 1,
    description: 'Listens for messages from a WebSocket server',
    defaults: {
      name: 'WebSocket Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        displayName: 'WebSocket URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'wss://example.com/socket',
        description: 'The WebSocket server URL to connect to',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const url = this.getNodeParameter('url') as string;

    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(url);

      ws.on('message', (data: WebSocket.RawData) => {
        const message = data.toString();
        this.emit([this.helpers.returnJsonArray([{ message }])]);
      });

      ws.on('error', (error: Error) => {
        this.emitError(new NodeOperationError(this.getNode(), error));
      });
    };

    connect();

    const closeFunction = async () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };

    return {
      closeFunction,
    };
  }
}
