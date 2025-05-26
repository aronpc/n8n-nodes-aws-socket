import { AwsWebSocket } from './nodes/AwsWebSocket/AwsWebSocket.node';
import { AwsWebSocketTrigger } from './nodes/AwsWebSocketTrigger/AwsWebSocketTrigger.node';
import { AwsWebSocketApi } from './credentials/AwsWebSocketApi.credentials';

export const nodeTypes = {
  AwsWebSocket,
  AwsWebSocketTrigger,
};

export const credentialTypes = {
  AwsWebSocketApi,
};
