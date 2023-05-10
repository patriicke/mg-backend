import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FindManyOptions, MoreThanOrEqual } from 'typeorm';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import config from 'config';
import {
  Pagination,
  PaginationInfoInterface,
  ExceptionTitleList,
  StatusCodesList,
  ForbiddenException,
  NotFoundException,
  CustomHttpException
} from '@app/common-module';

import { FrontendUserSerializer } from '../frontend-user';
import { FeRefreshToken } from './entities/fe-refresh-token.entity';
import { FeRefreshTokenInterface } from './interface/fe-refresh-token.interface';
import { FeRefreshTokenRepository } from './fe-refresh-token.repository';
import { RefreshPaginateFilterDto } from './dto/refresh-paginate-filter.dto';
import { FeRefreshTokenSerializer } from './serializer/fe-refresh-token.serializer';

const appConfig = config.get('app');
const jwtConfig = config.get('feJwt');
const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};
const SAME_SITE_NONE_SECURE = 'SameSite=None; Secure;';
// const SAME_SITE_NONE_SECURE = 'SameSite=Lax;';
const isSameSite =
  appConfig.sameSite !== null
    ? appConfig.sameSite
    : process.env.IS_SAME_SITE === 'true';

@Injectable()
export class FeRefreshTokenService {
  constructor(
    private readonly repository: FeRefreshTokenRepository,
    private readonly jwt: JwtService
  ) {}

  /**
   * Generate refresh token
   * @param user
   * @param refreshToken
   */
  public async generateRefreshToken(
    user: FrontendUserSerializer,
    refreshToken: Partial<FeRefreshToken>
  ): Promise<string> {
    let opts = {};
    const token = await this.repository.createRefreshToken(user, refreshToken);
    opts = {
      ...BASE_OPTIONS,
      subject: String(user.id),
      jwtid: String(token.id)
    };

    return this.jwt.signAsync(
      { ...opts },
      {
        expiresIn: jwtConfig.refreshExpiresIn
      }
    );
  }

  /**
   * Resolve encoded refresh token
   * @param encoded
   */
  public async resolveRefreshToken(encoded: string): Promise<{
    user: FrontendUserSerializer;
    token: any;
  }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);
    if (!token) {
      throw new CustomHttpException(
        ExceptionTitleList.NotFound,
        HttpStatus.NOT_FOUND,
        StatusCodesList.NotFound
      );
    }

    if (token.isRevoked) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    return {
      user,
      token
    };
  }

  /**
   * Create access token from refresh token
   * @param refresh
   */
  public async generateAccessToken(
    user: FrontendUserSerializer
  ): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id)
    };

    return this.jwt.signAsync(
      {
        ...opts
      },
      {
        expiresIn: jwtConfig.expiresIn
      }
    );
  }

  public async createAccessTokenFromRefreshToken(refresh: string): Promise<{
    _token: string;
    user: FrontendUserSerializer;
  }> {
    const { user } = await this.resolveRefreshToken(refresh);
    const _token = await this.generateAccessToken(user.user);
    return {
      user,
      _token
    };
  }

  /**
   * Decode refresh token
   * @param token
   */
  async decodeRefreshToken(token: string): Promise<FeRefreshTokenInterface> {
    try {
      return await this.jwt.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new CustomHttpException(
          ExceptionTitleList.RefreshTokenExpired,
          HttpStatus.BAD_REQUEST,
          StatusCodesList.RefreshTokenExpired
        );
      } else {
        throw new CustomHttpException(
          ExceptionTitleList.InvalidRefreshToken,
          HttpStatus.BAD_REQUEST,
          StatusCodesList.InvalidRefreshToken
        );
      }
    }
  }

  /**
   * get user detail from refresh token
   * @param payload
   */
  async getUserFromRefreshTokenPayload(
    payload: FeRefreshTokenInterface
  ): Promise<any> {
    const subId = payload.subject;

    if (!subId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    const userData = this.repository.getUserDataById(subId);
    if (!userData) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }
    return userData;
  }

  /**
   * Get refresh token entity from token payload
   * @param payload
   */

  async getStoredTokenFromRefreshTokenPayload(
    payload: FeRefreshTokenInterface
  ): Promise<any> {
    const tokenId = payload.jwtid;

    if (!tokenId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }
    const result: any = await this.repository.findTokenById(tokenId);
    return result;
  }

  /**
   * Get active refresh token list of user
   * @param userId
   */
  async getRefreshTokenByUserId(
    userId: number,
    filter: RefreshPaginateFilterDto
  ): Promise<Pagination<FeRefreshTokenSerializer>> {
    const paginationInfo: PaginationInfoInterface =
      this.repository.getPaginationInfo(filter);
    const findOptions: FindManyOptions = {
      where: {
        userId,
        isRevoked: false,
        expires: MoreThanOrEqual(new Date())
      }
    };
    const { page, skip, limit } = paginationInfo;
    findOptions.take = paginationInfo.limit;
    findOptions.skip = paginationInfo.skip;
    findOptions.order = {
      id: 'DESC'
    };
    const [results, total] = await this.repository.findAndCount(findOptions);
    const serializedResult = this.repository.transformMany(results);
    return new Pagination<FeRefreshTokenSerializer>({
      results: serializedResult,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0
    });
  }

  /**
   * Revoke refresh token by id
   * @param id
   * @param userId
   */
  async revokeRefreshTokenById(
    id: number,
    userId: number
  ): Promise<FeRefreshToken> {
    const token = await this.repository.findTokenById(id);
    if (!token) {
      throw new NotFoundException();
    }
    if (token.userId !== userId) {
      throw new ForbiddenException();
    }
    token.isRevoked = true;
    await token.save();
    return token;
  }

  async getRefreshTokenGroupedData(field: string) {
    return this.repository
      .createQueryBuilder('token')
      .select(`token.${field} AS type`)
      .where(`token.${field} IS NOT NULL`)
      .addSelect('COUNT(*)::int AS value')
      .groupBy(`token.${field}`)
      .getRawMany();
  }

  buildResponsePayload(accessToken: string, refreshToken?: string): string[] {
    let tokenCookies = [
      `Fe_Authentication=${accessToken}; HttpOnly; Path=/; ${
        !isSameSite ? SAME_SITE_NONE_SECURE : ''
      } Max-Age=${jwtConfig.cookieExpiresIn}`
    ];
    if (refreshToken) {
      const expiration = new Date();
      expiration.setSeconds(expiration.getSeconds() + jwtConfig.expiresIn);
      tokenCookies = tokenCookies.concat([
        `Fe_Refresh=${refreshToken}; HttpOnly; Path=/; ${
          !isSameSite ? SAME_SITE_NONE_SECURE : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`,
        `Fe_ExpiresIn=${expiration}; Path=/; ${
          !isSameSite ? SAME_SITE_NONE_SECURE : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`
      ]);
    }
    return tokenCookies;
  }

  getCookieForLogOut(): string[] {
    return [
      `Fe_Authentication=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? SAME_SITE_NONE_SECURE : ''
      }`,
      `Fe_Refresh=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? SAME_SITE_NONE_SECURE : ''
      }`,
      `Fe_ExpiresIn=; Path=/; Max-Age=0; ${
        !isSameSite ? SAME_SITE_NONE_SECURE : ''
      }`
    ];
  }
}
