import { AwsWebSocket } from './nodes/AwsWebSocket/AwsWebSocket.node';
import { WebSocketTrigger } from './nodes/WebSocketTrigger/WebSocketTrigger.node';
import { AwsWebSocketApi } from './credentials/AwsWebSocketApi.credentials';

export const nodeTypes = {
  AwsWebSocket,
  WebSocketTrigger,
};

export const credentialTypes = {
  AwsWebSocketApi,
};
