process.on('unhandledRejection', (reason, promise) => {
  console.log(new Date(), 'unhandledRejection', {reason, promise});
  // process.exit();
});

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import {autorun, observable, runInAction, toJS} from 'mobx';
import {queueProcessor} from 'mobx-utils';
import {RateLimiterMemory, RateLimiterQueue} from 'rate-limiter-flexible';
import * as booth from './booth';
import * as discord from './discord';

dotenv.config();

const limiter = new RateLimiterMemory({
  points: 2,
  duration: 10
});

const requestQueue = new RateLimiterQueue(limiter);

const KNWON_ITEM_IDS_FILE = 'known-item-ids.json';

const run = async (): Promise<void> => {
  console.info('Loading known Item IDs...');
  const cachedItemIdSet = new Set<string>();
  try {
    for (let itemId of JSON.parse(
      (await fs.promises.readFile(KNWON_ITEM_IDS_FILE)).toString()
    )) {
      cachedItemIdSet.add(itemId);
    }
  } catch {}
  console.info('Loaded Item IDs.');

  const knownItemIdSet = observable.set<string>(cachedItemIdSet);
  const enqueuedNotificationSet = observable.set<string>();
  const processingQueue = observable.array<booth.BoothItem>([]);

  autorun(
    () => {
      console.log('Updating known-item-ids.');
      fs.writeFileSync(
        KNWON_ITEM_IDS_FILE,
        JSON.stringify([...toJS(knownItemIdSet)])
      );
    },
    {delay: 1000}
  );

  autorun(
    () => {
      if (enqueuedNotificationSet.size) {
        console.info(`Notification Queue: ${enqueuedNotificationSet.size}`);
      }
    },
    {delay: 1000}
  );

  queueProcessor(
    processingQueue,
    (item) => {
      if (
        !knownItemIdSet.has(item.id) &&
        !enqueuedNotificationSet.has(item.id)
      ) {
        console.info(`Processing not seen Item: ${item.id} - <${item.title}>`);

        let url = `https://booth.pm/en/items/${item.id}`;
        let embeds = [
          {
            title: item.title,
            description: item.price,
            url,
            color: 16777215,
            author: {
              name: item.shopName,
              url: item.shopUrl,
              icon_url: item.shopImageUrl
            }
          }
        ] as any[];

        if (item.thumbnailImageUrls.length > 0) {
          embeds[0].image = {
            url: item.thumbnailImageUrls[0]
          };

          for (let i = 1; i < 4 && i < item.thumbnailImageUrls.length; ++i) {
            embeds.push({
              url,
              image: {
                url: item.thumbnailImageUrls[i]
              }
            });
          }
        }

        enqueuedNotificationSet.add(item.id);

        void requestQueue.removeTokens(1).then(() => {
          // Check again if we're still needing to send the notification
          if (knownItemIdSet.has(item.id)) {
            return;
          }

          console.info(`Sending notification for Item: ${item.id}`);
          return discord
            .executeWebhook(process.env.DISCORD_WEBHOOK_URL!, {
              embeds
            })
            .then(() => {
              runInAction(() => {
                knownItemIdSet.add(item.id);
                enqueuedNotificationSet.delete(item.id);
              });
            });
        });
      }
    },
    1000
  );

  const fetchAndAppendToQueue = (): void => {
    void booth.getNewestItems().then((result) => {
      runInAction(() => {
        processingQueue.push(...result.reverse());
      });
    });
  };

  console.info("Starting to fetch new items.")
  fetchAndAppendToQueue();
  setInterval(fetchAndAppendToQueue, 20000);
};

void run();
