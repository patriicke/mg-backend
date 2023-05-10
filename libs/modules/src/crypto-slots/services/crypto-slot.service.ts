import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import config from 'config';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { CustomHttpException } from '@app/common-module';
const cryptoSlotConfig = config.get('cryptoSlot');

@Injectable()
export class CryptoSlotService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheService: Cache) {}

  call(uri: string, method: string, data: Record<string, any> = {}) {
    const axiosOptions = {
      method,
      url: `${cryptoSlotConfig.baseUri}/${uri}`,
      headers: {
        accept: 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress'
      },
      timeout: 10000,
      maxRedirects: 5,
      ...{ data }
    };
    return axios.request(axiosOptions);
  }

  buildQueryString(filters: Record<string, any>) {
    return Object.keys(filters)
      .map(
        (k) =>
          `${encodeURIComponent(
            this.camelToUnderscore(k)
          )}=${encodeURIComponent(filters[k])}`
      )
      .join('&');
  }

  camelToUnderscore(str) {
    return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
  }

  async getCollections() {
    try {
      const cacheKey = 'crypto-slots/collections';

      const cachedCollection = await this.cacheService.get<any>(cacheKey);
      if (cachedCollection && cachedCollection.length) {
        return cachedCollection;
      }

      const query = this.buildQueryString({
        vsCurrency: 'usd',
        order: 'market_cap_desc',
        perPage: 175,
        page: 1,
        sparkline: false,
        locale: 'en'
      });
      const uri = `/coins/markets?${query}`;
      const { data } = await this.call(uri, 'GET');
      const mappedData = data
        .filter((item) => item.current_price >= 1)
        .map((item) => {
          return {
            id: item.id,
            symbol: item.symbol,
            name: item.name,
            image: item.image,
            currentPrice: item.current_price
          };
        });
      await this.cacheService.set<any>(cacheKey, mappedData, {
        ttl: 300
      });
      return mappedData;
    } catch (err) {
      console.log(err.message);
      throw new CustomHttpException('Failed to Fetch.');
    }
  }
}
