process.on('unhandledRejection', (reason, promise) => {
  console.log(new Date(), 'unhandledRejection', {reason, promise});
  // process.exit();
});

import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as util from './util';
import * as booth from './booth';
import * as discord from './discord';
import * as delay from 'delay';

async function run(): Promise<void> {
  try {
    let knownItemIdSet = new Set<string>(); // 들어온 순서 보장

    try {
      for (let itemId of JSON.parse(
        (await fs.promises.readFile('./config/known-item-ids.json')).toString()
      )) {
        knownItemIdSet.add(itemId);
      }
    } catch (err) {
      console.error(err);
    }

    let items = (await booth.getNewestItems()).reverse();

    for (let item of items) {
      if (knownItemIdSet.has(item.id) === true) {
        continue;
      }

      knownItemIdSet.add(item.id);

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

      await discord.executeWebhook(process.env.BOOTH_WEBHOOK_URL!, {
        embeds
      });
    }

    await fs.promises.writeFile(
      './config/known-item-ids.json',
      JSON.stringify([...knownItemIdSet].slice(-1000))
    );
    await delay(10000);
  } catch (err) {
    console.error(err);
  }
}

(function bootstrap(): void {
  run().catch(util.nop);
})();
