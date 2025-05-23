import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class AwsWebSocketApi implements ICredentialType {
  name = 'awsWebSocketApi';
  displayName = 'AWS WebSocket API';
  documentationUrl = 'https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html';
  properties: INodeProperties[] = [
    {
      displayName: 'AWS Access Key ID',
      name: 'awsAccessKeyId',
      type: 'string',
      default: '',
    },
    {
      displayName: 'AWS Secret Access Key',
      name: 'awsSecretAccessKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
    },
    {
      displayName: 'AWS Region',
      name: 'awsRegion',
      type: 'string',
      default: 'us-east-1',
    },
    {
      displayName: 'AWS Profile Name',
      name: 'awsProfileName',
      type: 'string',
      default: 'default',
      description: 'Optional profile name to use from AWS credentials file',
    },
    {
      displayName: 'API Gateway Endpoint',
      name: 'apiGatewayEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://xxxxx.execute-api.region.amazonaws.com/stage',
      description: 'The API Gateway endpoint URL for the WebSocket API',
      required: true,
    },
  ];
}
