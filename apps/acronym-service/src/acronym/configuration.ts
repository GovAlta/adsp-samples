import { AcronymDescription } from './types';

export const configurationSchema = {
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      acronym: {
        type: 'string',
        pattern: '^[a-zA-Z0-9]{1,20}$',
      },
      definitions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            context: { type: 'string' },
            represents: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
    },
  },
};

export type AcronymConfiguration = Record<string, AcronymDescription>;
