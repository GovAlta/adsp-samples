import {
  ActivityHandler,
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
} from 'botbuilder';
import { RequestHandler, Router } from 'express';
import { Logger } from 'winston';
import { AcronymConfiguration } from '../configuration';

interface RouterProps {
  BOT_CLIENT_ID: string;
  BOT_CLIENT_SECRET: string;
  BOT_APP_TYPE: string;
  BOT_TENANT_ID: string;
  handler: ActivityHandler;
  logger: Logger;
}

export function createBotRouter({
  BOT_CLIENT_ID,
  BOT_CLIENT_SECRET,
  BOT_APP_TYPE,
  BOT_TENANT_ID,
  handler,
  logger,
}: RouterProps): Router {
  const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: BOT_CLIENT_ID,
    MicrosoftAppPassword: BOT_CLIENT_SECRET,
    MicrosoftAppType: BOT_APP_TYPE,
    MicrosoftAppTenantId: BOT_TENANT_ID,
  });

  const botFrameworkAuthentication =
    createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
  const adapter = new CloudAdapter(botFrameworkAuthentication);

  const processMessage: RequestHandler = async (req, res, next) => {
    try {
      const [configuration] =
        await req.getConfiguration<AcronymConfiguration>();

      await adapter.process(req, res, async (context) => {
        context.turnState.set('acronymConfig', configuration);
        await handler.run(context);
      });
    } catch (err) {
      logger.debug(`Error encountered in processing message. ${err}`);
      next(err);
    }
  };

  const router = Router();
  router.post('/messages', processMessage);

  return router;
}
