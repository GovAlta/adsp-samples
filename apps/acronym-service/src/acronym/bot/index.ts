import { Application } from 'express';
import { Logger } from 'winston';
import { createActivityHandler } from './activityHandler';
import { createBotRouter } from './router';

export * from './router';

interface MiddlewareProps {
  BOT_CLIENT_ID: string;
  BOT_CLIENT_SECRET: string;
  BOT_APP_TYPE: string;
  BOT_TENANT_ID: string;
  logger: Logger;
}

export function applyBotMiddleware(
  app: Application,
  { logger, ...props }: MiddlewareProps
): Application {
  const handler = createActivityHandler({ logger });
  const router = createBotRouter({ ...props, logger, handler });
  app.use('/bot/v1', router);
  return app;
}
