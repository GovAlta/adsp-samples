import { Storage, StoreItems } from 'botbuilder';
import { RedisClient } from 'redis';
import { Logger } from 'winston';

class RedisStorage implements Storage {
  constructor(
    private readonly logger: Logger,
    private readonly client: RedisClient
  ) {}

  async read(keys: string[]): Promise<StoreItems> {
    const getPromises = keys.map(
      (key) =>
        new Promise<{ key: string; value: unknown }>((resolve, reject) =>
          this.client.GET(key, (err, value) =>
            err
              ? reject(err)
              : resolve({ key, value: value ? JSON.parse(value) : null })
          )
        )
    );

    try {
      const values = await Promise.all(getPromises);
      return values.reduce(
        (items, { key, value }) => ({ ...items, [key]: value }),
        {}
      );
    } catch (err) {
      this.logger.error(`Error encountered reading storage keys. ${err}`);
      throw err;
    }
  }

  async write(changes: StoreItems): Promise<void> {
    const setPromises = Object.entries(changes).map(
      ([key, value]) =>
        new Promise<void>((resolve, reject) =>
          this.client.SET(key, value ? JSON.stringify(value) : null, (err) =>
            err ? reject(err) : resolve()
          )
        )
    );

    try {
      await Promise.all(setPromises);
    } catch (err) {
      this.logger.error(`Error encountered writing storage items. ${err}`);
      throw err;
    }
  }

  async delete(keys: string[]): Promise<void> {
    const deletePromise = new Promise<void>((resolve, reject) =>
      this.client.DEL(keys, (err) => (err ? reject(err) : resolve()))
    );

    try {
      await deletePromise;
    } catch (err) {
      this.logger.error(`Error encountered deleting storage keys. ${err}`);
      throw err;
    }
  }
}

interface StorageProps {
  logger: Logger;
  client: RedisClient;
}

export function createConversationStateStorage({
  logger,
  client,
}: StorageProps): Storage {
  return new RedisStorage(logger, client);
}
