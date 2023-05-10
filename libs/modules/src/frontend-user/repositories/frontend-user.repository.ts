import { DeepPartial, DataSource, ObjectLiteral } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import config from 'config';
import {
  BaseRepository,
  ExceptionTitleList,
  generateRandomCode,
  Pagination,
  PaginationInfoInterface,
  StatusCodesList
} from '@app/common-module';

import { FrontendUser } from '../entities/frontend-user.entity';
import { FrontendUserSerializer } from '../serializers/frontend-user.serializer';
import { SearchFrontendUserDto } from '../dto/search-frontend-user.dto';
import { Injectable } from '@nestjs/common';
import { ILoginPayload } from '../interfaces/login-interface';
import { BalanceType } from '@app/modules/balance';
@Injectable()
export class FrontendUserRepository extends BaseRepository<
  FrontendUser,
  FrontendUserSerializer
> {
  constructor(private dataSource: DataSource) {
    super(FrontendUser, dataSource.createEntityManager());
  }

  async generateUniqueCode(length: number, columnCheck: string) {
    const code = generateRandomCode(length);
    const condition: ObjectLiteral = {
      [columnCheck]: code
    };
    const checkCount = await this.countEntityByCondition(condition);
    if (checkCount > 0) {
      await this.generateUniqueCode(length, columnCheck);
    }
    return code;
  }

  static transform(
    model: FrontendUser,
    transformOption = {}
  ): FrontendUserSerializer {
    return plainToInstance(
      FrontendUserSerializer,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  static transformMany(
    models: FrontendUser[],
    transformOption = {}
  ): FrontendUserSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }

  async paginate(
    searchFilter: DeepPartial<SearchFrontendUserDto>,
    searchCriteria: string[] = [],
    transformOptions = {}
  ): Promise<Pagination<FrontendUserSerializer>> {
    const queryBuilder = this.createQueryBuilder('frontendUser');
    if (searchFilter.hasOwnProperty('keywords') && searchFilter.keywords) {
      for (const key of searchCriteria) {
        queryBuilder.orWhere(`"${key}" ILIKE :keywords`, {
          keywords: `%${searchFilter.keywords}%`
        });
      }
    }

    if (searchFilter.hasOwnProperty('status') && searchFilter.status) {
      queryBuilder.andWhere('frontendUser.status = :status', {
        status: searchFilter.status
      });
    }

    const paginationInfo: PaginationInfoInterface =
      this.getPaginationInfo(searchFilter);

    const { page, skip, limit } = paginationInfo;

    const [results, total] = await queryBuilder
      .offset(skip)
      .limit(limit)
      .orderBy('frontendUser.createdAt', 'DESC')
      .getManyAndCount();

    const serializedResults = this.transformMany(results, transformOptions);
    return new Pagination<FrontendUserSerializer>({
      results: serializedResults,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0
    });
  }

  async store(payload: DeepPartial<FrontendUser>): Promise<FrontendUser> {
    const user = this.create(payload);
    await user.save();
    return user;
  }

  async getUserByToken(token: string): Promise<FrontendUser> {
    const query = this.createQueryBuilder('frontend_user');
    query.where('frontend_user.token = :token', { token });
    query.andWhere('frontend_user.tokenExpiry > :date', {
      date: new Date()
    });
    return query.getOne();
  }

  async getUserByReferralCode(referralCode: string): Promise<FrontendUser> {
    return this.findOne({
      where: {
        referralCode
      },
      select: ['id']
    });
  }

  async getUserById(id: number, selectedColumns?: []): Promise<FrontendUser> {
    return this.findOne({
      where: {
        id
      },
      select: selectedColumns
    });
  }

  async getUserByEmailOrUsername(
    email: string,
    username: string
  ): Promise<FrontendUser> {
    const query = this.createQueryBuilder('frontend_user');
    query.where('frontend_user.email = :email', { email });
    query.orWhere('frontend_user.username = :username', { username });
    query.select([
      'frontend_user.id',
      'frontend_user.accountVerified',
      'frontend_user.email',
      'frontend_user.username'
    ]);
    return query.getOne();
  }

  async login(
    loginPayload: ILoginPayload
  ): Promise<[user: FrontendUser, error: string, code: number]> {
    const { email, password } = loginPayload;
    const user = await this.findOne({
      where: [
        {
          email: email
        }
      ]
    });
    if (user && !user.accountVerified) {
      return [
        null,
        ExceptionTitleList.UnverifiedAccount,
        StatusCodesList.UnverifiedAccount
      ];
    }
    if (user && (await user.validatePassword(password))) {
      if (!user.status) {
        return [
          null,
          ExceptionTitleList.UserInactive,
          StatusCodesList.UserInactive
        ];
      }
      return [user, null, null];
    }
    return [
      null,
      ExceptionTitleList.InvalidCredentials,
      StatusCodesList.InvalidCredentials
    ];
  }

  async getTotalRemainingBalance(userId: number): Promise<number> {
    const data = await this.query(
      'select round(SUM(amount), 2) from balance where "userId"=$1 and (type != $2 or type is null)',
      [userId, BalanceType.REFERRAL_BONUS]
    );
    return parseFloat(data?.[0]?.round ?? 0);
  }

  async getReferralBonusDetails(user: FrontendUser) {
    const [invitedUsersCount, firstDepositsCount] = await Promise.all([
      this.count({
        where: {
          referralId: user.id
        }
      }),
      this.query(
        'select count(distinct "userId") from referral_deposit_track rdt where "referralUserId" = $1;',
        [user.id]
      )
    ]);

    return {
      invitedUsersCount,
      firstDepositsCount: parseInt(firstDepositsCount?.[0]?.count ?? 0),
      referralPoints: user?.referralPoints || 0
    };
  }

  async getDefaultProfileImages() {
    const images = await this.query(
      'select id, image from default_profile_image'
    );
    return images.map((item) => {
      return {
        id: item.id,
        image: `${config.get('app.appUrl')}/default-images/${item.image}`
      };
    });
  }

  async getDefaultImageById(id: number) {
    return this.query(`
    select id, image from default_profile_image where id = ${id}
    `);
  }
}
