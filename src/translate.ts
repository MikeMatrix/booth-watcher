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

export const translateToEn = async (text: string): Promise<string | null> => {
  if (!process.env.AZURE_TRANSLATE_SUBSCRIPTION_KEY) {
      return null
  }
  if (!process.env.AZURE_TRANSLATE_SUBSCRIPTION_REGION) {
      return null
  }

  try {
    const response = await api.request({
      method: 'POST',
      url: 'https://api.cognitive.microsofttranslator.com/translate',
      data: [{text}],
      headers: {
        'Ocp-Apim-Subscription-Key':
          process.env.AZURE_TRANSLATE_SUBSCRIPTION_KEY ?? '',
        'Ocp-Apim-Subscription-Region':
          process.env.AZURE_TRANSLATE_SUBSCRIPTION_REGION ?? '',
        'Content-type': 'application/json'
      },
      params: {
        'api-version': '3.0',
        to: 'en'
      },
      responseType: 'json'
    });
    return response?.data?.[0]?.translations?.[0]?.text ?? null;
  } catch (e) {
    return null;
  }
};
