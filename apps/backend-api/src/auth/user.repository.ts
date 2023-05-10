import { Brackets, DataSource, DeepPartial } from 'typeorm';
import bcrypt from 'bcrypt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
  BaseRepository,
  ExceptionTitleList,
  StatusCodesList,
  PaginationInfoInterface,
  Pagination
} from '@app/common-module';

import { UserEntity } from '../auth/entity/user.entity';
import { UserLoginDto } from '../auth/dto/user-login.dto';
import { UserSerializer } from '../auth/serializer/user.serializer';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { UserStatusEnum } from '../auth/user-status.enum';
import { UserSearchFilterDto } from './dto/user-search-filter.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity, UserSerializer> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }
  /**
   * store new user
   * @param createUserDto
   * @param token
   */
  async store(
    createUserDto: DeepPartial<UserEntity>,
    token: string
  ): Promise<UserEntity> {
    if (!createUserDto.status) {
      createUserDto.status = UserStatusEnum.INACTIVE;
    }
    createUserDto.salt = await bcrypt.genSalt();
    createUserDto.token = token;
    const user = this.create(createUserDto);
    await user.save();
    return user;
  }

  /**
   * login user
   * @param userLoginDto
   */
  async login(
    userLoginDto: UserLoginDto
  ): Promise<[user: UserEntity, error: string, code: number]> {
    const { email, password } = userLoginDto;
    const user = await this.findOne({
      where: [
        {
          email: email
        }
      ]
    });
    if (user && (await user.validatePassword(password))) {
      if (user.status !== UserStatusEnum.ACTIVE) {
        return [
          null,
          ExceptionTitleList.UserInactive,
          StatusCodesList.UserInactive
        ];
      }
      if (user.disabled !== false) {
        return [
          null,
          ExceptionTitleList.UserDisabled,
          StatusCodesList.UserDisabled
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

  /**
   * Get user entity for reset password
   * @param resetPasswordDto
   */
  async getUserForResetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<UserEntity> {
    const { token } = resetPasswordDto;
    const query = this.createQueryBuilder('user');
    query.where('user.token = :token', { token });
    query.andWhere('user.tokenValidityDate > :date', {
      date: new Date()
    });
    return query.getOne();
  }

  /**
   * transform user
   * @param model
   * @param transformOption
   */
  transform(model: UserEntity, transformOption = {}): UserSerializer {
    return plainToInstance(
      UserSerializer,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  /**
   * transform users collection
   * @param models
   * @param transformOption
   */
  transformMany(models: UserEntity[], transformOption = {}): UserSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }

  async paginate(
    searchFilter: DeepPartial<UserSearchFilterDto>,
    searchCriteria: string[] = [],
    transformOptions = {}
  ): Promise<any> {
    const queryBuilder = this.createQueryBuilder('user');
    const searchKeywordArray = searchFilter?.keywords
      ?.replace(/\s+/g, ' ')
      ?.trim()
      ?.split(' ');

    if (searchFilter.keywords) {
      // using logical brackets for OR cases
      // so that we can use AND later
      queryBuilder.orWhere(
        new Brackets((qb) => {
          for (const key of searchCriteria) {
            qb.orWhere(`${key} ILIKE :keywords`, {
              keywords: `%${searchFilter.keywords}%`
            });
          }

          searchKeywordArray?.forEach((word) => {
            if (word) {
              qb.orWhere(`"firstName" ILIKE :firstName`, {
                firstName: `%${word}%`
              });
              qb.orWhere(`"lastName" ILIKE :lastName`, {
                lastName: `%${word}%`
              });
            }
          });
        })
      );
    }

    if (searchFilter.roleId) {
      queryBuilder.andWhere(`"roleId" = :roleId`, {
        roleId: +searchFilter.roleId
      });
    }
    // select non-deleted admins only
    queryBuilder.andWhere(`"disabled" = :disabled`, {
      disabled: false
    });
    const paginationInfo: PaginationInfoInterface =
      this.getPaginationInfo(searchFilter);

    const { page, skip, limit } = paginationInfo;

    const [results, total] = await queryBuilder
      .leftJoinAndSelect('user.role', 'role')
      .offset(skip)
      .limit(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    const serializedResult = this.transformMany(results, transformOptions);
    return new Pagination<UserSerializer>({
      results: serializedResult,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0
    });
  }
}
