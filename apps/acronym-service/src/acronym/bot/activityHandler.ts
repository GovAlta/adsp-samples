import {
  AdspId,
  adspId,
  ServiceDirectory,
  TokenProvider,
} from '@govalta/adsp-service-sdk';
import axios from 'axios';
import {
  Activity,
  ActivityHandler,
  BotHandler,
  ConversationState,
  StatePropertyAccessor,
  Storage,
  TurnContext,
} from 'botbuilder';
import { Logger } from 'winston';
import { AcronymConfiguration } from '../configuration';

interface Submission {
  prompt: 'context' | 'description' | 'none';
  acronym: string;
  represents: string;
  context?: string;
  description?: string;
}

const SUBMISSION = 'ACRONYM_SUBMISSION';

class AcronymBotActivityHandler extends ActivityHandler {
  private readonly submissionAccessor: StatePropertyAccessor<Submission>;

  public handleAskAcronym = async (context: TurnContext, acronym: string) => {
    const configuration =
      context.turnState.get<AcronymConfiguration>('acronymConfig');

    let reply: Partial<Activity>;

    const { definitions = null } = configuration[acronym];
    if (definitions) {
      reply = {
        text: `${definitions
          .map(
            ({ context, represents, description }) =>
              `**${represents} (${acronym})** - ${context}\n` +
              `> ${description}`
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
  };

  public handleAcronymSubmission = async (
    context: TurnContext,
    text: string,
    submission: Submission
  ) => {
    this.logger.debug(
      `Processing acronym submission for ${submission.acronym} = ${submission.represents}...`
    );

    let reply: Partial<Activity>;
    switch (submission.prompt) {
      case 'context': {
        submission.prompt = 'description';
        reply = {
          text:
            `**${submission.represents} (${submission.acronym})**\n` +
            `*What is the context of this acronym?*\n` +
            `The same acronym may represent multiple things. ` +
            `Please provide the context where this representation applies. ` +
            `For example, if it applies to Service Alberta organization, ` +
            `reply: 'Service Alberta organization'`,
          textFormat: 'markdown',
        };
        break;
      }
      case 'description': {
        submission.context = text;
        submission.prompt = 'none';
        reply = {
          text:
            `**${submission.represents} (${submission.acronym})** - ${submission.context}\n` +
            `*What does it mean?*\n` +
            `Please provide a brief description of what is represented.`,
          textFormat: 'markdown',
        };
        break;
      }
      case 'none': {
        submission.description = text;
        reply = {
          text:
            `Thank you for submitting a new definition: \n` +
            `**${submission.represents} (${submission.acronym})** - ${submission.context}\n` +
            `> ${submission.description}`,
          textFormat: 'markdown',
        };
      }
    }
    await context.sendActivity(reply);
  };

  public updateAcronym = async (
    turnContext: TurnContext,
    { acronym, represents, context, description }: Submission
  ) => {
    const configuration =
      turnContext.turnState.get<AcronymConfiguration>('acronymConfig');
    const { definitions = [] } = configuration[acronym];

    const configurationServiceUrl = await this.directory.getServiceUrl(
      adspId`urn:ads:platform:configuration-service`
    );
    const token = await this.tokenProvider.getAccessToken();

    const request = {
      operation: 'UPDATE',
      update: {
        [acronym]: [...definitions, { represents, context, description }],
      },
    };
    const { data: _data } = await axios.patch(
      new URL(
        `/configuration/v2/configuration/${this.serviceId.namespace}/${this.serviceId.service}`,
        configurationServiceUrl
      ).href,
      request,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  public handleMessage: BotHandler = async (context, next) => {
    this.logger.debug(`Received message: ${context.activity.text}`);

    let submission = await this.submissionAccessor.get(context, null);

    // Look for single token representing the acronym being requested.
    const [askMatch, acronym] = /^\s*([a-zA-Z0-9]{1,20})\s*$/g.exec(
      context.activity.text
    );

    // Look for text in format of {acronym} = {representation}
    const [submissionMatch, acronymEquals, represents] =
      /^\s*([a-zA-Z0-9]{1,20})\s?=\s?(.{1,150})$/g.exec(context.activity.text);

    if (submission && context.activity.text.toLowerCase() === 'cancel') {
      this.logger.debug(`Cancelling submission conversation...`);
      await this.submissionAccessor.delete(context);
      context.sendActivity(
        `Cancelled submission of ${submission.acronym} = ${submission.represents}`
      );
    } else if (submission) {
      this.logger.debug(`Continuing submission conversation...`);
      await this.handleAcronymSubmission(
        context,
        context.activity.text,
        submission
      );
    } else if (submissionMatch) {
      this.logger.debug(
        `Starting submission conversation for ${acronymEquals} = ${represents}...`
      );
      submission = {
        prompt: 'context',
        acronym: acronymEquals,
        represents,
      };
      await this.submissionAccessor.set(context, submission);

      await this.handleAcronymSubmission(
        context,
        context.activity.text,
        submission
      );
    } else if (askMatch) {
      this.logger.debug(`Processing acronym ask for ${acronym}...`);
      await this.submissionAccessor.delete(context);
      await this.handleAskAcronym(context, acronym);
    }
    await next();
  };

  constructor(
    private readonly logger: Logger,
    private readonly conversationState: ConversationState,
    private readonly serviceId: AdspId,
    private readonly tokenProvider: TokenProvider,
    private readonly directory: ServiceDirectory
  ) {
    super();

    this.submissionAccessor = conversationState.createProperty(SUBMISSION);
    this.onMessage(this.handleMessage);
  }

  override async run(context: TurnContext): Promise<void> {
    await super.run(context);
    this.conversationState.saveChanges(context);
  }
}

interface HandlerProps {
  logger: Logger;
  storage: Storage;
  serviceId: AdspId;
  directory: ServiceDirectory;
  tokenProvider: TokenProvider;
}

export function createActivityHandler({
  logger,
  storage,
  serviceId,
  directory,
  tokenProvider,
}: HandlerProps) {
  return new AcronymBotActivityHandler(
    logger,
    new ConversationState(storage),
    serviceId,
    tokenProvider,
    directory
  );
}
