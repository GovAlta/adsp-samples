import { Storage, StoreItems } from 'botbuilder';
import { RedisClient } from 'redis';

class RedisStorage implements Storage {
  constructor(private client: RedisClient) {}

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

    const values = await Promise.all(getPromises);
    return values.reduce(
      (items, { key, value }) => ({ ...items, [key]: value }),
      {}
    );
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

    await Promise.all(setPromises);
  }

  async delete(keys: string[]): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      this.client.DEL(keys, (err) => (err ? reject(err) : resolve()))
    );
  }
}

interface StorageProps {
  client: RedisClient;
}

export function createConversationStateStorage({
  client,
}: StorageProps): Storage {
  return new RedisStorage(client);
}
