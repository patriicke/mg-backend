import { Injectable, Inject, CACHE_MANAGER, HttpStatus } from '@nestjs/common';
import Web3 from 'web3';
import { Cache } from 'cache-manager';
import BigNumber from 'bignumber.js';
import { OpenSeaSDK, Network } from 'opensea-js';
import config from 'config';
import { RankingEnum } from 'apps/frontend-api/src/nft/http/requests/nft-collection.request';
import axios from 'axios';
import { CustomHttpException, getAcronym } from '@app/common-module';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Not } from 'typeorm';
import { NftEntity } from '../entities/nft.entity';
import { NftRepository } from '../repositories/nft-repository';

const openseaConfig = config.get('opensea');

const provider = new Web3.providers.HttpProvider(openseaConfig.provider);
@Injectable()
export class NftService {
  private readonly openSeaSdk: OpenSeaSDK;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @InjectEntityManager()
    readonly entityManager: EntityManager,
    private readonly repository: NftRepository
  ) {
    this.openSeaSdk = new OpenSeaSDK(provider, {
      networkName: Network.Main,
      apiKey: openseaConfig.apiKey
    });
  }

  async getPopularNFTCollections(filter: {
    readonly ranking?: RankingEnum;
    readonly cursor?: string;
    readonly pageSize?: number;
  }) {
    try {
      const chain = 'eth-main';
      const exchange = 'opensea';
      const cacheKey = `nft-ranking`;
      const cachedCollection = await this.cacheService.get<any>(cacheKey);
      if (cachedCollection && cachedCollection.length) {
        return cachedCollection;
      }
      const filters = {
        chain,
        ranking: filter.ranking || 'total_volume',
        exchange,
        page_size: 15
      };
      const query = this.buildQueryString(filters);
      const { data } = await this.getNfts(
        `https://api.blockspan.com/v1/exchanges/collectionsranking?${query}`
      );
      let result: any = [];
      if (data.results) {
        result = data.results.map((item: any) => {
          return {
            key: item.key,
            name: item.name,
            address: item.contracts[0].contract_address
          };
        });
      }
      await this.cacheService.set<any>(cacheKey, result, {
        ttl: 24 * 60
      });
      return result;
    } catch (error) {
      throw new CustomHttpException(
        'error getting popular collections',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  buildQueryString(filters: Record<string, string | number>) {
    return Object.keys(filters)
      .map(
        (k) =>
          `${encodeURIComponent(
            this.camelToUnderscore(k)
          )}=${encodeURIComponent(filters[k])}`
      )
      .join('&');
  }
  async getAllNFTsWithPrices(
    address: string,
    props: Partial<{
      page: number;
      limit: number;
    }>
  ) {
    try {
      const pageNumber = props.page || 1;
      const pageSize = props.limit || 50;
      const offset = (pageNumber - 1) * pageSize;
      const cacheKey = `collections-${address}-${pageNumber}-${pageSize}`;
      const cachedCollection = await this.cacheService.get<any>(cacheKey);
      if (cachedCollection && cachedCollection?.length) {
        return cachedCollection;
      }
      const nfts: any = await this.openSeaSdk.api.get('/assets', {
        asset_contract_address: address,
        limit: pageSize,
        offset: offset,
        order_by: 'sale_count',
        order_direction: 'asc'
      });
      const nftsWithPrices = nfts?.assets?.filter((nft) => nft.num_sales);
      const nftWithDetail = nftsWithPrices?.map(this.extractDetailAndPrice);

      const tokenIds: string[] = nftWithDetail?.map((nft) => nft.tokenId);

      if (tokenIds.length === 0) {
        return [];
      }

      const chunkSize = 15;
      const numChunks = Math.ceil(tokenIds.length / chunkSize);
      const askOrders = [];

      // Chunk the tokenIds array into groups of 15
      for (let i = 0; i < numChunks; i++) {
        const startIndex = i * chunkSize;
        const endIndex = startIndex + chunkSize;
        const chunk = tokenIds.slice(startIndex, endIndex);

        const results: any = await this.openSeaSdk.api.getOrders({
          side: 'ask',
          assetContractAddress: address,
          tokenIds: chunk
        });
        askOrders.push(...results.orders);
      }

      const askOrdersMap: any = new Map();

      askOrders?.forEach((order) => {
        if (!askOrdersMap.has(order?.makerAssetBundle?.assets[0]?.tokenId)) {
          askOrdersMap.set(order?.makerAssetBundle?.assets[0]?.tokenId, {
            tokenID: order?.makerAssetBundle?.assets[0]?.tokenId,
            price: new BigNumber(order?.currentPrice)
          });
        }
      });

      const finalResult: any = nftWithDetail?.map((nft) => {
        return {
          ...nft,
          ethPrice: askOrdersMap.get(nft.tokenId)?.price,
          askPrice: askOrdersMap
            .get(nft.tokenId)
            ?.price.dividedBy(nft.powOf)
            .multipliedBy(nft.usdConversion)
        };
      });

      await this.cacheService.set<any>(cacheKey, finalResult, {
        ttl: 60 * 60
      });
      return finalResult;
    } catch (error) {
      return {
        result: [],
        next: null,
        previous: null
      };
    }
  }

  private extractDetailAndPrice(nft) {
    const totalPrice = new BigNumber(
      nft.last_sale?.total_price || nft.lastSale?.totalPrice || 0
    );
    const ten = new BigNumber(10);
    const powOf = ten.pow(
      nft.last_sale?.payment_token?.decimals ||
        nft.lastSale?.paymentToken?.decimals ||
        0
    );
    const usdConversion = new BigNumber(
      nft.last_sale?.payment_token?.usd_price ||
        nft.lastSale?.paymentToken?.usdPrice ||
        0
    );
    const lastSalePrice = totalPrice
      .dividedBy(powOf)
      .multipliedBy(usdConversion);
    return {
      tokenId: nft.token_id || nft.tokenId,
      image: nft.image_url || nft.imageUrl,
      shortName: nft?.asset_contract?.name || nft?.assetContract?.name,
      name: nft.name,
      contractAddress:
        nft.asset_contract?.address || nft.assetContract?.address || '',
      chain: nft.asset_contract?.chain_identifier || nft.chain || '',
      collectionName: nft.collection?.name || nft.collectionName || '',
      powOf: powOf,
      usdConversion,
      lastSalePrice
    };
  }

  async getFloorPrice(tokenAddress, tokenId) {
    const cacheKey = `floorprice-${tokenAddress}-${tokenId}`;
    const cachedCollection = await this.cacheService.get<any>(cacheKey);
    if (cachedCollection && cachedCollection.length) {
      return cachedCollection;
    }
    const nft: any = await this.openSeaSdk.api.getAsset({
      tokenAddress,
      tokenId
    });

    const mappedNft = this.extractDetailAndPrice(nft);
    let price = mappedNft.lastSalePrice;

    const { orders } = await this.openSeaSdk.api.getOrders({
      side: 'ask',
      assetContractAddress: tokenAddress,
      tokenId: tokenId
    });
    if (orders?.length) {
      price = orders[0]?.currentPrice
        ? new BigNumber(orders[0]?.currentPrice)
            .dividedBy(mappedNft.powOf)
            .multipliedBy(mappedNft.usdConversion)
        : price;
    }
    const result = {
      slug: nft.collection.slug,
      tokenId: nft.tokenId,
      image: nft.imageUrl,
      name: nft.name,
      contractAddress: nft.assetContract?.address || '',
      chain: nft.assetContract?.chain || '',
      collectionName: nft.collection?.name || '',
      price
    };
    await this.cacheService.set<any>(cacheKey, result, {
      ttl: 180
    });
    return result;
  }

  getNfts(url: string) {
    const axiosOptions = {
      method: 'GET',
      url,
      headers: {
        accept: 'application/json',
        'X-API-KEY': 'Pl4vutY6TkwSUmOpAPpFVI0ujcZiLrxk'
      }
    };
    return axios.request(axiosOptions);
  }

  camelToUnderscore(str) {
    return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
  }

  async syncNftCollection() {
    const pageNumber = 1;
    const pageSize = 50;
    const offset = (pageNumber - 1) * pageSize;
    const topCollections = await this.getPopularNFTCollections({});
    const bulkPayload = [];

    for (const collection of topCollections) {
      try {
        const nfts: any = await this.openSeaSdk.api.get('/assets', {
          asset_contract_address: collection.address,
          limit: pageSize,
          offset: offset,
          order_by: 'sale_count',
          order_direction: 'asc'
        });
        const filteredNfts = nfts?.assets?.filter((nft) => nft.num_sales);
        for (const item of filteredNfts) {
          bulkPayload.push({
            tokenId: item.token_id,
            nftContractAddress: item.asset_contract?.address,
            contractType: item.asset_contract?.asset_contract_type,
            chain: item.asset_contract?.chain_identifier,
            name: item.name,
            shortName: getAcronym(item.collection.name),
            collectionName: item.collection.name,
            slug: item.collection?.slug,
            numSales: item.num_sales,
            description: item.asset_contract?.description,
            imageUrl: item.image_url,
            lastSaleTotalPrice: item.last_sale?.total_price,
            lastSaleDecimals: item.last_sale?.payment_token?.decimals,
            lastSaleUsdPrice: item.last_sale?.payment_token?.usd_price
          });
        }
      } catch (err) {
        continue;
      }
    }
    try {
      await this.entityManager.transaction(async (queryRunner) => {
        await queryRunner.delete(NftEntity, {
          id: Not(0)
        });
        await queryRunner.save(NftEntity, bulkPayload);
      });
    } catch (error) {
      throw new CustomHttpException('Problem in Syncing.');
    }
  }

  async getFilteredNft(payload) {
    const filteredNftData = await this.repository.getFilteredResults(
      payload.keyword,
      ['name', 'collectionName', 'shortName']
    );
    if (filteredNftData.length === 0) {
      return [];
    }
    const mappedResults = [];

    for (const item of filteredNftData) {
      try {
        const nft: any = await this.openSeaSdk.api.getAsset({
          tokenAddress: item.nftContractAddress,
          tokenId: item.tokenId
        });
        nft.chain = item?.chain;
        const mappedNft = this.extractDetailAndPrice(nft);

        const { orders } = await this.openSeaSdk.api.getOrders({
          side: 'ask',
          assetContractAddress: mappedNft.contractAddress,
          tokenId: mappedNft.tokenId
        });

        if (orders?.length && orders[0]?.currentPrice) {
          mappedNft['askPrice'] = new BigNumber(orders[0]?.currentPrice)
            .dividedBy(mappedNft.powOf)
            .multipliedBy(mappedNft.usdConversion);
        }
        mappedResults.push(mappedNft);
      } catch (err) {
        continue;
      }
    }
    return mappedResults;
  }
}
