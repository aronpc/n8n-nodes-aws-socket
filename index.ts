import { INodeType, INodeTypeDescription, ICredentialType } from 'n8n-workflow';
import { AwsWebSocket } from './nodes/AwsWebSocket/AwsWebSocket.node';
import { AwsWebSocketApi } from './credentials/AwsWebSocketApi.credentials';

export class AwsWebSocketNode implements INodeType {
  description: INodeTypeDescription = new AwsWebSocket().description;

  async execute() {
    return await new AwsWebSocket().execute.apply(this, arguments);
  }
}

export const nodeTypes = {
  AwsWebSocket: AwsWebSocketNode,
};

export const credentialTypes = {
  AwsWebSocketApi,
};
