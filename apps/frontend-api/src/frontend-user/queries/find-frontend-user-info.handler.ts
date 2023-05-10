import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { FrontendUserRepository } from '@app/modules/frontend-user';

import { FrontendUserInfoResult } from '../query-results/frontend-user-info.result';
import { FindFrontendUserInfo } from './find-frontend-user-info';
import { NotFoundException } from '@app/common-module';
import { TransactionType } from '@app/modules/transaction';

@QueryHandler(FindFrontendUserInfo)
export class FindFrontendUserInfoHandler
  implements IQueryHandler<FindFrontendUserInfo>
{
  constructor(
    readonly queryBus: QueryBus,
    readonly frontendUserRepository: FrontendUserRepository
  ) {}

  async execute(query: FindFrontendUserInfo): Promise<FrontendUserInfoResult> {
    if (
      !['id', 'email', 'auth0Id', 'emailUsername'].includes(
        query.identifierType
      )
    ) {
      throw new BadRequestException('Invalid user identifier supplied');
    }

    const queryBuilder = this.frontendUserRepository
      .createQueryBuilder('frontendUser')
      .loadRelationCountAndMap(
        'frontendUser.totalDepositCount',
        'frontendUser.transactions',
        'transactions',
        (qb) =>
          qb.where('transactions.type = :type', {
            type: TransactionType.DEPOSIT
          })
      );
    switch (query.identifierType) {
      case 'id':
        queryBuilder.where('frontendUser.id = :id', {
          id: query.identifier
        });
        break;
      case 'emailUsername':
        queryBuilder.where('frontendUser.email = :email', {
          email: query.identifier
        });
        queryBuilder.orWhere('frontendUser.username = :username', {
          username: query.identifier
        });
        break;
      case 'email':
        queryBuilder.where('frontendUser.email = :email', {
          email: query.identifier
        });
        break;
      case 'auth0Id':
        queryBuilder.where('frontendUser.authId = :authId', {
          authId: query.identifier
        });
        break;
      default:
        break;
    }
    if (query.identifierType === 'emailUsername') {
      queryBuilder.where('frontendUser.email = :email', {
        email: query.identifier
      });
      queryBuilder.orWhere('frontendUser.username = :username', {
        username: query.identifier
      });
    }
    const user = await queryBuilder.getOne();

    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return new FrontendUserInfoResult({
      id: user.id,
      email: user.email,
      username: user.username,
      accountVerified: user.accountVerified,
      referralCode: user.referralCode,
      referralId: user.referralId,
      showUsername: user.showUsername,
      referralPoints: user.referralPoints,
      totalWalletBalance:
        await this.frontendUserRepository.getTotalRemainingBalance(user.id),
      getPlainUsername: true,
      totalDepositCount: user?.totalDepositCount ?? 0,
      ...(user.avatar && { avatar: user.avatar })
    });
  }
}
