import { Application } from 'express';
import { createActivityHandler } from './activityHandler';
import { createBotRouter } from './router';

export * from './router';

interface MiddlewareProps {
  BOT_CLIENT_ID: string;
  BOT_CLIENT_SECRET: string;
  BOT_APP_TYPE: string;
  BOT_TENANT_ID: string;
}

export function applyBotMiddleware(
  app: Application,
  props: MiddlewareProps
): Application {
  const handler = createActivityHandler();
  const router = createBotRouter({ ...props, handler });
  app.use('/bot/v1', router);
  return app;
}
