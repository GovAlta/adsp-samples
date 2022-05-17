import { AdspId, GoAError, initializeService } from '@govalta/adsp-service-sdk';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import * as fs from 'fs';
import * as passport from 'passport';
import {
  ChatServiceRoles,
  createChatRouter,
  MessageSentEventDefinition,
} from './chat';
import { environment } from './environments/environment';

async function initializeApp(): Promise<express.Application> {
  const app = express();
  app.use(compression());
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  if (environment.TRUSTED_PROXY) {
    app.set('trust proxy', environment.TRUSTED_PROXY);
  }

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const {
    configurationHandler,
    directory,
    eventService,
    healthCheck,
    tenantStrategy,
    tokenProvider,
  } = await initializeService(
    {
      displayName: 'Chat service',
      description: 'Provides chat capabilities',
      realm: environment.TENANT_REALM,
      serviceId,
      clientSecret: environment.CLIENT_SECRET,
      accessServiceUrl: new URL(environment.ACCESS_SERVICE_URL),
      directoryUrl: new URL(environment.DIRECTORY_SERVICE_URL),
      configurationSchema: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
      events: [MessageSentEventDefinition],
      fileTypes: [
        {
          id: 'chat-files',
          name: 'Chat files',
          anonymousRead: false,
          readRoles: [`${serviceId}:${ChatServiceRoles.Chatter}`],
          updateRoles: [`${serviceId}:${ChatServiceRoles.Chatter}`],
        },
      ],
      eventStreams: [
        {
          id: 'chat-messages',
          name: 'Chat messages',
          description: 'Stream of message-sent events',
          events: [
            {
              namespace: 'chat-service',
              name: 'message-sent',
            },
          ],
          publicSubscribe: false,
          subscriberRoles: [`${serviceId}:${ChatServiceRoles.Chatter}`],
        },
      ],
    },
    { logLevel: environment.LOG_LEVEL }
  );

  passport.use('tenant', tenantStrategy);

  const router = createChatRouter({ directory, eventService, tokenProvider });
  app.use(
    '/chat/v1',
    passport.authenticate('tenant', { session: false }),
    configurationHandler,
    router
  );

  let swagger = null;
  app.use('/swagger/docs/v1', (_req, res) => {
    if (swagger) {
      res.json(swagger);
    } else {
      fs.readFile(`${__dirname}/swagger.json`, 'utf8', (err, data) => {
        if (err) {
          res.sendStatus(404);
        } else {
          swagger = JSON.parse(data);
          res.json(swagger);
        }
      });
    }
  });

  app.get('/health', async (_req, res) => {
    const platform = await healthCheck();
    res.json(platform);
  });

  app.get('/', (req, res) => {
    const rootUrl = new URL(`${req.protocol}://${req.get('host')}`);
    res.send({
      name: 'Chat service',
      description: 'Service for real-time chat.',
      _links: {
        self: { href: new URL(req.originalUrl, rootUrl).href },
        health: { href: new URL('/health', rootUrl).href },
        api: { href: new URL('/chat/v1', rootUrl).href },
        docs: { href: new URL('/swagger/docs/v1', rootUrl).href },
      },
    });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof GoAError) {
      res.status(err.extra?.statusCode || 500).send(err.message);
    } else {
      res.sendStatus(500);
    }
  };

  app.use(errorHandler);

  return app;
}

initializeApp().then((app) => {
  const port = environment.port || 3333;

  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/chat/v1`);
  });
  server.on('error', console.error);
});
