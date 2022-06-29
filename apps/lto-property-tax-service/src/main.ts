/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import {
  AdspId,
  GoAError,
  initializeService,
  ServiceMetricsValueDefinition,
} from '@govalta/adsp-service-sdk';
import axios from 'axios';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import { ErrorRequestHandler } from 'express';
import * as fs from 'fs';
import helmet from 'helmet';
import * as passport from 'passport';
import { environment } from './environments/environment';

async function initializeApp(): Promise<express.Application> {
  const app = express();
  app.use(compression());
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use(passport.initialize());
  app.use(passport.session());

  if (environment.TRUSTED_PROXY) {
    app.set('trust proxy', environment.TRUSTED_PROXY);
  }

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const {
    directory,
    healthCheck,
    metricsHandler,
    tenantStrategy,
    tokenProvider,
  } = await initializeService(
    {
      displayName: 'LTO property tax service',
      description: 'Service for land titles property tax program.',
      realm: environment.TENANT_REALM,
      serviceId,
      clientSecret: environment.CLIENT_SECRET,
      accessServiceUrl: new URL(environment.ACCESS_SERVICE_URL),
      directoryUrl: new URL(environment.DIRECTORY_SERVICE_URL),
      values: [ServiceMetricsValueDefinition],
    },
    { logLevel: environment.LOG_LEVEL }
  );

  passport.use('tenant', tenantStrategy);

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
      name: 'LTO property tax service',
      description: 'Service for land titles property tax program.',
      _links: {
        self: { href: new URL(req.originalUrl, rootUrl).href },
        health: { href: new URL('/health', rootUrl).href },
        api: { href: new URL('/lto-tax/v1', rootUrl).href },
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
    console.log(`Listening at http://localhost:${port}/lto-tax/v1`);
  });
  server.on('error', console.error);
});
