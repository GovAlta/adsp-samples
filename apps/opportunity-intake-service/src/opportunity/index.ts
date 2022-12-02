import { User } from '@abgov/adsp-service-sdk';
import { Application } from 'express';
import { createOpportunityRouter, RouterProps } from './router';
import { codeStrategy, creatorStrategy } from './strategy';

export async function applyOpportunityMiddleware(
  app: Application,
  { passport, directory, tokenProvider }: RouterProps
): Promise<Application> {
  passport.use('creator', creatorStrategy);
  passport.use('code', codeStrategy(directory, tokenProvider));
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: User, done) => {
    done(null, user);
  });

  const router = await createOpportunityRouter({
    passport,
    directory,
    tokenProvider,
  });
  app.use('/opportunity/v1', router);

  return app;
}
