import {
  DomainEvent,
  DomainEventDefinition,
  User,
} from '@govalta/adsp-service-sdk';

export const MessageSentEventDefinition: DomainEventDefinition = {
  name: 'message-sent',
  description: 'Signalled when a new message is sent.',
  payloadSchema: {
    type: 'object',
    properties: {
      room: {
        type: 'string',
      },
      message: {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              urn: { type: 'string' },
            }
          },
          {
            type: 'array',
            items: {
              oneOf: [
                {
                  type: 'string',
                },
                {
                  type: 'object',
                  properties: {
                    urn: { type: 'string' },
                  }
                }
              ]
            }
          }
        ],
      },
      from: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  },
};

export const messageSent = (
  user: User,
  roomId: string,
  message: string
): DomainEvent => ({
  tenantId: null,
  name: 'message-sent',
  timestamp: new Date(),
  correlationId: roomId,
  context: {
    roomId,
    fromUserId: user.id,
  },
  payload: {
    room: roomId,
    message,
    from: {
      id: user.id,
      name: user.name,
    },
  },
});
