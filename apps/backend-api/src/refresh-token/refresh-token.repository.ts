import { DataSource } from 'typeorm';
import config from 'config';
import { BaseRepository } from '@app/common-module';

import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { UserSerializer } from '../auth/serializer/user.serializer';
import { RefreshTokenSerializer } from '../refresh-token/serializer/refresh-token.serializer';
import { Injectable } from '@nestjs/common';

const tokenConfig = config.get('jwt');
@Injectable()
export class RefreshTokenRepository extends BaseRepository<
  RefreshToken,
  RefreshTokenSerializer
> {
  constructor(private dataSource: DataSource) {
    super(RefreshToken, dataSource.createEntityManager());
  }
  /**
   * Create refresh token
   * @param user
   * @param tokenPayload
   */
  public async createRefreshToken(
    user: UserSerializer,
    tokenPayload: Partial<RefreshToken>
  ): Promise<RefreshToken> {
    const token = this.create();
    token.userId = user.id;
    token.isRevoked = false;
    token.ip = tokenPayload.ip;
    token.userAgent = tokenPayload.userAgent;
    token.browser = tokenPayload.browser;
    token.os = tokenPayload.os;
    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + tokenConfig.refreshExpiresIn
    );
    token.expires = expiration;
    return token.save();
  }

  /**
   * find token by id
   * @param id
   */
  public async findTokenById(id: number): Promise<RefreshToken | null> {
    return this.findOne({
      where: {
        id
      }
    });
  }
}
