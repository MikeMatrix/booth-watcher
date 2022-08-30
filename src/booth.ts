import * as https from 'https';
import * as axios from 'axios';
import * as cheerio from 'cheerio';
import * as constants from './constants';

export interface BoothItem {
  id: string;
  title: string;
  price: string;
  shopName: string;
  shopUrl: string;
  shopImageUrl: string;
  thumbnailImageUrls: string[];
}

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 60000 // 60s
});

export const client = axios.default.create({
  headers: {
    'User-Agent': constants.userAgent,
    Cookie: 'adult=t'
  },
  httpsAgent
});

export async function getNewestItems(): Promise<BoothItem[]> {
  let items = [] as BoothItem[];

  const boothUrls = [
    process.env.BOOTH_FETCH_URL,
    process.env.BOOTH_FETCH_URL_0,
    process.env.BOOTH_FETCH_URL_1,
    process.env.BOOTH_FETCH_URL_2,
    process.env.BOOTH_FETCH_URL_3,
    process.env.BOOTH_FETCH_URL_4,
    process.env.BOOTH_FETCH_URL_5,
    process.env.BOOTH_FETCH_URL_6,
    process.env.BOOTH_FETCH_URL_7,
    process.env.BOOTH_FETCH_URL_8,
    process.env.BOOTH_FETCH_URL_9
  ].filter(Boolean);

  for (const url of boothUrls) {
    console.log(`Fetching current dataset from: ${url}`);
    let response = await client.request<string>({ url });
  
    let $ = cheerio.load(response.data);
  
    $('.item-card').each((_index, el) => {
      let thumbnailImages = [] as string[];
  
      $('.item-card__thumbnail-image', el).each((_subIndex, subEl) => {
        let imageUrl = $(subEl).attr('data-original');
        if (imageUrl === void 0) {
          return;
        }
        thumbnailImages.push(imageUrl);
      });
  
      items.push({
        id: $(el).data('productId') ?? '',
        title: $('.item-card__title', el).text(),
        price: $('.price', el).text(),
        shopName: $('.item-card__shop-name', el).text(),
        shopUrl: $('.item-card__shop-name-anchor', el).attr('href') ?? '',
        shopImageUrl: $('.user-avatar', el).attr('src') ?? '',
        thumbnailImageUrls: thumbnailImages
      } as BoothItem);
    });
  }

  return items;
}
