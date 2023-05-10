import { Inject, Injectable, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { NotFoundException } from '@app/common-module';
import { ExcelService } from '@app/modules/excel';
import { SearchFrontendUserDto } from '../dto/search-frontend-user.dto';
import { FrontendUserRepository } from '../repositories/frontend-user.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

export const basicGroupsForSerializing: string[] = ['basic'];
export const adminGroupsForSerializing: string[] = ['admin'];

@Injectable({ scope: Scope.REQUEST })
export class FrontendUserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly repository: FrontendUserRepository,
    private readonly excelService: ExcelService
  ) {}
  findAll(searchFrontendUserDto: SearchFrontendUserDto) {
    this.logger.info('FrontendUser_MODULE<findAll>', {
      meta: {
        payload: searchFrontendUserDto,
        type: 'info'
      }
    });
    return this.repository.paginate(
      searchFrontendUserDto,
      ['firstName', 'lastName', 'email'],
      { groups: [...basicGroupsForSerializing] }
    );
  }

  findActiveFrontendUserCount() {
    return this.repository.count({
      where: {
        status: true
      }
    });
  }

  async findOne(id: number) {
    return this.repository.get(id, [], {
      groups: [...basicGroupsForSerializing]
    });
  }

  async findFrontendUserEntity(id: number) {
    return await this.repository.findOne({
      where: {
        id
      }
    });
  }

  async toggleDisable(id: number) {
    const FrontendUser = await this.repository.findOne({
      where: {
        id
      }
    });
    if (!FrontendUser) {
      this.logger.error('FrontendUser_MODULE<Toggle Disable>', {
        meta: {
          payload: { id: id },
          type: 'FrontendUser not found'
        }
      });
      throw new NotFoundException('FrontendUserNotFound');
    }

    const updatedUser = await this.repository.updateEntity(
      FrontendUser,
      { status: !FrontendUser.status },
      [],
      {
        groups: [...basicGroupsForSerializing]
      }
    );

    return updatedUser;
  }

  async resetPassword(id: number) {
    const FrontendUser = await this.repository.get(id, [], {
      groups: [...basicGroupsForSerializing, ...adminGroupsForSerializing]
    });
    if (!FrontendUser) {
      this.logger.error('FrontendUser_MODULE<ResetPassword>', {
        meta: {
          payload: id,
          type: 'FrontendUser not found'
        }
      });
      throw new NotFoundException('FrontendUserNotFound');
    }
  }

  private async getAllFrontendUser() {
    return await this.repository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async exportFrontendUser(): Promise<any> {
    const FrontendUser = await this.getAllFrontendUser();
    const _FrontendUser = FrontendUser.map((FrontendUser, index) => {
      return {
        ['S.N.']: index + 1,
        ['Email']: FrontendUser.email,
        ['Status']: FrontendUser.status ? 'Active' : 'Inactive',
        ['Join Date']: new Date(FrontendUser.createdAt)
      };
    });
    return this.excelService.createExcel(_FrontendUser, 'FrontendUser');
  }
}
