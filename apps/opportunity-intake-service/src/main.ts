/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import {
  adspId,
  AdspId,
  GoAError,
  initializeService,
} from '@govalta/adsp-service-sdk';
import axios from 'axios';
import * as compression from 'compression';
import * as expressRedis from 'connect-redis';
import * as cors from 'cors';
import * as express from 'express';
import { ErrorRequestHandler } from 'express';
import * as session from 'express-session';
import * as fs from 'fs';
import helmet from 'helmet';
import * as passport from 'passport';
import { createClient } from 'redis';
import { promisify } from 'util';
import { environment } from './environments/environment';
import { applyOpportunityMiddleware } from './opportunity';
import { ServiceRoles } from './opportunity/roles';

const RedisStore = expressRedis(session);

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
  app.use(
    session({
      store: redisClient
        ? new RedisStore({ client: redisClient })
        : new session.MemoryStore(),
      secret: environment.SESSION_SECRET,
      resave: false,
      rolling: true,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: 'auto',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  if (environment.TRUSTED_PROXY) {
    app.set('trust proxy', environment.TRUSTED_PROXY);
  }

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const { directory, healthCheck, tenantStrategy, tokenProvider } =
    await initializeService(
      {
        displayName: 'Opportunity intake service',
        description: 'Service for intake of platform opportunities.',
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
        fileTypes: [
          {
            id: 'opportunity-supporting-files',
            name: 'Opportunity supporting files',
            anonymousRead: false,
            readRoles: [
              `${serviceId}:${ServiceRoles.OpportunityAdmin}`,
              'urn:ads:platform:form-service:intake-application',
            ],
            updateRoles: ['urn:ads:platform:form-service:intake-application'],
          },
        ],
        serviceConfigurations: [
          {
            serviceId: adspId`urn:ads:platform:form-service`,
            configuration: {
              'opportunity-intake': {
                id: 'opportunity-intake',
                anonymousApply: true,
                name: 'Opportunity intake',
                description: 'Submissions of platform opportunities.',
                applicantRoles: [],
                formDraftUrlTemplate: `${environment.SERVICE_URL}/submission/{{ id }}`,
                assessorRoles: [
                  'urn:ads:autotest:opportunity-intake-service:opportunity-admin',
                ],
              },
            },
          },
        ],
      },
      { logLevel: environment.LOG_LEVEL }
    );

  passport.use('tenant', tenantStrategy);

  await applyOpportunityMiddleware(app, { passport, directory, tokenProvider });

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
      name: 'Opportunity intake service',
      description: 'Service for intake of platform opportunities.',
      commit,
      _links: {
        self: { href: new URL(req.originalUrl, rootUrl).href },
        health: { href: new URL('/health', rootUrl).href },
        api: { href: new URL('/opportunity/v1', rootUrl).href },
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
  const port = environment.port || 3334;

  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/opportunity/v1`);
  });
  server.on('error', console.error);
});
