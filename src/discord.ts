import * as https from 'https';
import * as axios from 'axios';
import * as constants from './constants';

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 60000 // 60s
});

export const api = axios.default.create({
  headers: {
    'User-Agent': constants.userAgent
  },
  httpsAgent
});

export async function executeWebhook(
  webhookUrl: string,
  data: any
): Promise<void> {
  if (webhookUrl.length === 0) {
    return;
  }

  await api.request({
    method: 'POST',
    url: webhookUrl,
    data
  });
}
