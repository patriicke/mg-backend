import { DataSource } from 'typeorm';
import config from 'config';
import { BaseRepository } from '@app/common-module';
import { FeRefreshToken } from './entities/fe-refresh-token.entity';
import { FeRefreshTokenSerializer } from './serializer/fe-refresh-token.serializer';
import { Injectable } from '@nestjs/common';
import { FrontendUserSerializer } from '../frontend-user';

const tokenConfig = config.get('feJwt');
@Injectable()
export class FeRefreshTokenRepository extends BaseRepository<
  FeRefreshToken,
  FeRefreshTokenSerializer
> {
  constructor(private dataSource: DataSource) {
    super(FeRefreshToken, dataSource.createEntityManager());
  }
  /**
   * Create refresh token
   * @param user
   * @param tokenPayload
   */
  public async createRefreshToken(
    user: FrontendUserSerializer,
    tokenPayload: Partial<FeRefreshToken>
  ): Promise<FeRefreshToken> {
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
  public async findTokenById(id: number): Promise<FeRefreshToken | null> {
    return this.findOne({
      where: {
        id
      }
    });
  }

  public async getUserDataById(id: number): Promise<FeRefreshToken | null> {
    return this.createQueryBuilder('fe_refresh_token')
      .leftJoinAndSelect('fe_refresh_token.user', 'user')
      .where('fe_refresh_token.userId = :id', { id })
      .getOne();
  }
}
