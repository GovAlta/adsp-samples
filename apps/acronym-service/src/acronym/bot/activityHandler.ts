import { Activity, ActivityHandler, BotHandler } from 'botbuilder';
import { Logger } from 'winston';
import { AcronymConfiguration } from '../configuration';

class AcronymBotActivityHandler extends ActivityHandler {
  public handleMessage: BotHandler = async (context, next) => {
    this.logger.debug(`Received message: ${context.activity.text}`);

    const acronym = /^\s*([a-zA-Z0-9]{1,20})\s*$/.exec(
      context.activity.text
    )[0];

    if (acronym) {
      this.logger.debug(`Processing acronym ask for ${acronym}...`);
      const configuration =
        context.turnState.get<AcronymConfiguration>('acronymConfig');

      let reply: Partial<Activity>;

      const { definitions = null } = configuration[acronym];
      if (definitions) {
        reply = {
          text: `${definitions
            .map(
              ({ context, represents, description }) =>
                `**${represents} (${acronym})** - ${context}\n> ${description}`
            )
            .join('\n')}`,
          textFormat: 'markdown',
        };
      } else {
        reply = {
          text: `Sorry, I don't know **${acronym}**. If you figure it out, let me know...`,
          textFormat: 'markdown',
        };
      }

      await context.sendActivity(reply);
      this.logger.debug(`Sent bot reply.`);
    }
    await next();
  };

  constructor(private logger: Logger) {
    super();

    this.onMessage(this.handleMessage);
  }
}

interface HandlerProps {
  logger: Logger;
}

export function createActivityHandler({ logger }: HandlerProps) {
  return new AcronymBotActivityHandler(logger);
}
