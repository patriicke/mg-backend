import {
  RateLimiterRes,
  RateLimiterStoreAbstract
} from 'rate-limiter-flexible';

export abstract class LimitConsumerHandlerHelper {
  constructor(protected readonly rateLimiter: RateLimiterStoreAbstract) {}
  async limitConsumerPromiseHandler(
    key: string
  ): Promise<[RateLimiterRes, RateLimiterRes]> {
    return new Promise((resolve) => {
      this.rateLimiter
        .consume(key)
        .then((rateLimiterRes) => {
          resolve([rateLimiterRes, null]);
        })
        .catch((rateLimiterError) => {
          resolve([null, rateLimiterError]);
        });
    });
  }
}
