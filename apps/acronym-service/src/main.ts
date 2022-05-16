import { AdspId, GoAError, initializeService } from '@govalta/adsp-service-sdk';
import axios from 'axios';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import { ErrorRequestHandler } from 'express';
import * as fs from 'fs';
import helmet from 'helmet';
import * as passport from 'passport';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import { createClient } from 'redis';
import { promisify } from 'util';
import {
  applyAcronymMiddleware,
  applyBotMiddleware,
  configurationSchema,
} from './acronym';
import { environment } from './environments/environment';
import { handleAcronymUpdate } from './io';
import { createConversationStateStorage } from './redis';
import { createLogger } from './winston';

function connectRedis() {
  const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = environment;
  if (REDIS_PASSWORD) {
    return createClient(
      `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/0`
    );
  } else {
    return null;
  }
}

async function initializeApp(): Promise<express.Application> {
  const redisClient = connectRedis();

  const app = express();
  app.use(compression());
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(passport.initialize());

  if (environment.TRUSTED_PROXY) {
    app.set('trust proxy', environment.TRUSTED_PROXY);
  }

  const logger = createLogger('acronym-service', environment.LOG_LEVEL);

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const {
    clearCached,
    configurationHandler,
    directory,
    healthCheck,
    tenantStrategy,
    tokenProvider,
  } = await initializeService(
    {
      displayName: 'Acronym service',
      description: 'Service for looking up acronyms.',
      realm: environment.TENANT_REALM,
      serviceId,
      clientSecret: environment.CLIENT_SECRET,
      accessServiceUrl: new URL(environment.ACCESS_SERVICE_URL),
      directoryUrl: new URL(environment.DIRECTORY_SERVICE_URL),
      configurationSchema,
      eventStreams: [
        {
          id: 'acronym-updates',
          name: 'Acronym updates',
          description:
            'Stream of configuration update events for acronym service.',
          publicSubscribe: false,
          subscriberRoles: ['urn:ads:platform:tenant-service:platform-service'],
          events: [
            {
              namespace: 'configuration-service',
              name: 'configuration-updated',
              criteria: {
                context: {
                  namespace: serviceId.namespace,
                  name: serviceId.service,
                },
              },
            },
          ],
        },
      ],
    },
    logger
  );

  passport.use('tenant', tenantStrategy);
  passport.use('anonymous', new AnonymousStrategy());

  await handleAcronymUpdate(serviceId, directory, tokenProvider, () =>
    clearCached(serviceId)
  );

  app.use(
    '/acronym/v1',
    passport.authenticate(['tenant', 'anonymous'], { session: false }),
    configurationHandler
  );

  applyAcronymMiddleware(app, {
    serviceId,
    directory,
    tokenProvider,
  });

  app.use('/bot/v1', configurationHandler);

  const storage = createConversationStateStorage({ client: redisClient });
  applyBotMiddleware(app, {
    ...environment,
    logger,
    storage,
    serviceId,
    tokenProvider,
    directory,
  });

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

  const commit = await promisify(fs.readFile)(
    '/etc/podinfo/commit',
    'utf8'
  ).catch(() => '');

  app.get('/', (req, res) => {
    const rootUrl = new URL(`${req.protocol}://${req.get('host')}`);
    res.send({
      name: 'Acronym service',
      description: 'Service for intake of platform opportunities.',
      commit,
      _links: {
        self: { href: new URL(req.originalUrl, rootUrl).href },
        health: { href: new URL('/health', rootUrl).href },
        api: { href: new URL('/acronym/v1', rootUrl).href },
        docs: { href: new URL('/swagger/docs/v1', rootUrl).href },
      },
    });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof GoAError) {
      res.status(err.extra?.statusCode || 500).send(err.message);
    } else if (axios.isAxiosError(err)) {
      res.status(err.response?.status || 500).send(err.message);
    } else {
      res.sendStatus(500);
    }
  };

  app.use(errorHandler);

  return app;
}

initializeApp().then((app) => {
  const port = environment.port || 3335;

  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/acronym/v1`);
  });
  server.on('error', console.error);
});
