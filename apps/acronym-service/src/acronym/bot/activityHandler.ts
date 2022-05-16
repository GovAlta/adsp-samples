import { Activity, ActivityHandler, BotHandler } from 'botbuilder';
import { AcronymConfiguration } from '../configuration';

class AcronymBotActivityHandler extends ActivityHandler {
  public handleMessage: BotHandler = async (context, next) => {
    const acronym = /^\s*([a-zA-Z0-9]{1,20})/.exec(context.activity.text)[0];
    if (acronym) {
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
    }
    await next();
  };

  constructor() {
    super();

    this.onMessage(this.handleMessage);
  }
}

export function createActivityHandler() {
  return new AcronymBotActivityHandler();
}
