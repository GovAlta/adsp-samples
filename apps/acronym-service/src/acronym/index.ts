import { Application } from 'express';
import { createAcronymRouter, RouterProps } from './router';

export * from './configuration';
export * from './bot';

export function applyAcronymMiddleware(
  app: Application,
  props: RouterProps
): Application {
  const router = createAcronymRouter(props);
  app.use('/acronym/v1', router);
  return app;
}
