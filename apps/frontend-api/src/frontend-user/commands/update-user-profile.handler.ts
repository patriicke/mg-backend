import { UnprocessableEntityException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import * as fs from 'fs';
import {
  FrontendUserRepository,
  FrontendUserSerializer
} from '@app/modules/frontend-user';
import { Not } from 'typeorm';
import {
  CustomHttpException,
  ValidationPayloadInterface
} from '@app/common-module';
import { UpdateUserProfile } from './update-user-profile';
import { FindFrontendUserInfo } from '../queries/find-frontend-user-info';
import path from 'path';
@CommandHandler(UpdateUserProfile)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfile>
{
  constructor(
    private readonly repository: FrontendUserRepository,
    private readonly queryBus: QueryBus
  ) {}
  async execute(
    command: UpdateUserProfile
  ): Promise<Partial<FrontendUserSerializer>> {
    const { userData, params } = command;
    Promise.all([
      await this.checkUniqueUserNameOrEmail(
        'email',
        params?.email,
        userData.id
      ),
      await this.checkUniqueUserNameOrEmail(
        'username',
        params?.username,
        userData.id
      )
    ]);

    if (params.defaultPicId) {
      const defaultImg = await this.repository.getDefaultImageById(
        params.defaultPicId
      );
      if (!defaultImg?.[0]) {
        throw new CustomHttpException('Invalid default image.');
      }
      params.avatar = defaultImg?.[0]?.image;
    }
    if (userData.avatar && params.avatar) {
      const imagePath = path.join(
        process.cwd(),
        `/public/images/frontend-profile/${userData.avatar}`
      );
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    delete params.defaultPicId;
    await this.repository.update(userData.id, params);
    return this.queryBus.execute(
      FindFrontendUserInfo.byId(userData.id.toString())
    );
  }
  async checkUniqueUserNameOrEmail(
    identifier: string,
    value: string,
    id: number
  ) {
    if (value) {
      let cond: { username: string } | { email: string } = { username: value };
      let property = 'username';
      if (identifier == 'email') {
        property = 'email';
        cond = { email: value };
      }
      const errorPayload: ValidationPayloadInterface[] = [];
      const checkUnique = await this.repository.countEntityByCondition({
        id: Not(id),
        ...cond
      });
      if (checkUnique > 0) {
        errorPayload.push({
          property,
          constraints: {
            unique: 'already taken'
          }
        });
      }
      if (Object.keys(errorPayload).length > 0) {
        throw new UnprocessableEntityException(errorPayload);
      }
    }
  }
}
