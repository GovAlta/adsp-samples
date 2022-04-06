import {
  adspId,
  EventService,
  GoAError,
  isAllowedUser,
  ServiceDirectory,
  TokenProvider,
} from '@govalta/adsp-service-sdk';
import axios from 'axios';
import { RequestHandler, Router } from 'express';
import * as hasha from 'hasha';
import { messageSent } from './events';
import { ChatServiceRoles, Room } from './types';

interface RouterProps {
  eventService: EventService;
  directory: ServiceDirectory;
  tokenProvider: TokenProvider;
}

export const getRooms: RequestHandler = async (req, res, next) => {
  try {
    const [rooms] = await req.getConfiguration<Record<string, Room>>();

    return res.send(Object.values(rooms));
  } catch (err) {
    next(err);
  }
};

export const getRoom: RequestHandler = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const [rooms] = await req.getConfiguration<Record<string, Room>>();
    const room = rooms[roomId];
    if (!room) {
      throw new GoAError(`Room with ID: ${roomId} not found`, {
        statusCode: 404,
      });
    }

    req['room'] = room;
    next();
  } catch (err) {
    next(err);
  }
};

interface MessageEventValue {
  timestamp: string;
  value: {
    payload: {
      timestamp: string;
      hash: string;
      room: string;
      message: unknown;
      from: { name: string; id: string };
    };
  };
}

interface EventLogResponse {
  'event-service': {
    event: MessageEventValue[];
  };
  page: unknown;
}

export function getMessages(
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): RequestHandler {
  return async (req, res, next) => {
    try {
      const room: Room = req['room'];
      const { top, after } = req.query;
      const user = req.user;

      if (!isAllowedUser(user, null, ChatServiceRoles.Chatter)) {
        throw new GoAError('User not allowed to get messages.', {
          statusCode: 403,
        });
      }

      const valueApiUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:value-service:v1`
      );
      const valuesUrl = new URL('v1/event-service/values/event', valueApiUrl);
      const token = await tokenProvider.getAccessToken();

      const { data } = await axios.get<EventLogResponse>(valuesUrl.href, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          top,
          after,
          context: {
            namespace: 'chat-service',
            name: 'message-sent',
            roomId: room.id,
          },
        },
      });

      res.send({
        results: data['event-service'].event.map(({ timestamp, value }) => ({
          hash:
            value.payload.hash ||
            hasha(JSON.stringify(value.payload), { algorithm: 'sha1' }),
          room: value.payload.room,
          timestamp,
          message: value.payload.message,
          from: value.payload.from,
        })),
        page: data.page,
      });
    } catch (err) {
      next(err);
    }
  };
}

export function sendMessage(eventService: EventService): RequestHandler {
  return async (req, res, next) => {
    try {
      const room: Room = req['room'];
      const { message } = req.body;
      const user = req.user;

      if (!isAllowedUser(user, null, ChatServiceRoles.Chatter)) {
        throw new GoAError('User not allowed to send message.', {
          statusCode: 403,
        });
      }

      const event = messageSent(user, room.id, message);
      eventService.send(event);
      res.send(event.payload);
    } catch (err) {
      next(err);
    }
  };
}

export function createChatRouter({
  eventService,
  directory,
  tokenProvider,
}: RouterProps) {
  const router = Router();

  router.get('/rooms', getRooms);
  router.get('/rooms/:roomId', getRoom, (req, res) => res.send(req['room']));
  router.get(
    '/rooms/:roomId/messages',
    getRoom,
    getMessages(directory, tokenProvider)
  );
  router.post('/rooms/:roomId/messages', getRoom, sendMessage(eventService));

  return router;
}
