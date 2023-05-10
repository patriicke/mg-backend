import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
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

import { AuthService } from '../auth/auth.service';
import { UserSerializer } from '../auth/serializer/user.serializer';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { RefreshTokenInterface } from '../refresh-token/interface/refresh-token.interface';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import { RefreshPaginateFilterDto } from '../refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenSerializer } from '../refresh-token/serializer/refresh-token.serializer';

const appConfig = config.get('app');
const tokenConfig = config.get('jwt');
const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};

interface SerealizedRefreshToken extends RefreshToken {
  isTwoFAAuthenticated: boolean;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly repository: RefreshTokenRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly jwt: JwtService
  ) {}

  /**
   * Generate refresh token
   * @param user
   * @param refreshToken
   */
  public async generateRefreshToken(
    user: UserSerializer,
    refreshToken: Partial<RefreshToken>,
    isTwoFAAuthenticated = false
  ): Promise<string> {
    let opts = {};
    if (isTwoFAAuthenticated) {
      opts = {
        ...BASE_OPTIONS,
        subject: String(user.id),
        jwtid: String(refreshToken.id),
        isTwoFAAuthenticated: isTwoFAAuthenticated
      };
    } else {
      const token = await this.repository.createRefreshToken(
        user,
        refreshToken
      );
      opts = {
        ...BASE_OPTIONS,
        subject: String(user.id),
        jwtid: String(token.id),
        isTwoFAAuthenticated: isTwoFAAuthenticated
      };
    }
    return this.jwt.signAsync(
      { ...opts },
      {
        expiresIn: tokenConfig.refreshExpiresIn
      }
    );
  }

  /**
   * Resolve encoded refresh token
   * @param encoded
   */
  public async resolveRefreshToken(encoded: string): Promise<{
    user: UserSerializer;
    token: SerealizedRefreshToken;
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
  public async createAccessTokenFromRefreshToken(refresh: string): Promise<{
    _token: string;
    user: UserSerializer;
  }> {
    const { user, token } = await this.resolveRefreshToken(refresh);
    const _token = await this.authService.generateAccessToken(
      user,
      token.isTwoFAAuthenticated
    );
    return {
      user,
      _token
    };
  }

  /**
   * Decode refresh token
   * @param token
   */
  async decodeRefreshToken(token: string): Promise<RefreshTokenInterface> {
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
    payload: RefreshTokenInterface
  ): Promise<UserSerializer> {
    const subId = payload.subject;

    if (!subId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    return this.authService.findById(subId);
  }

  /**
   * Get refresh token entity from token payload
   * @param payload
   */

  async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenInterface
  ): Promise<SerealizedRefreshToken> {
    const tokenId = payload.jwtid;

    if (!tokenId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    const result: any = await this.repository.findTokenById(tokenId);
    result.isTwoFAAuthenticated = payload.isTwoFAAuthenticated;
    return result;
  }

  /**
   * Get active refresh token list of user
   * @param userId
   */
  async getRefreshTokenByUserId(
    userId: number,
    filter: RefreshPaginateFilterDto
  ): Promise<Pagination<RefreshTokenSerializer>> {
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
    return new Pagination<RefreshTokenSerializer>({
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
  ): Promise<RefreshToken> {
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
}
