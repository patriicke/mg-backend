import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Not, ObjectLiteral } from 'typeorm';
import { CommonServiceInterface, Pagination } from '@app/common-module';

import { CreatePermissionDto } from '../permission/dto/create-permission.dto';
import { UpdatePermissionDto } from '../permission/dto/update-permission.dto';
import { PermissionRepository } from '../permission/permission.repository';
import { PermissionFilterDto } from '../permission/dto/permission-filter.dto';
import { Permission } from '../permission/serializer/permission.serializer';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { basicFieldGroupsForSerializing } from '../role/serializer/role.serializer';
import {
  PermissionConfiguration,
  RoutePayloadInterface
} from '../config/permission-config';
import { LoadPermissionMisc } from '../permission/misc/load-permission.misc';

@Injectable()
export class PermissionsService
  extends LoadPermissionMisc
  implements CommonServiceInterface<Permission>
{
  constructor(private readonly repository: PermissionRepository) {
    super();
  }

  /**
   * Create new Permission
   * @param createPermissionDto
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.repository.createEntity(createPermissionDto);
  }

  /**
   * Sync Permission with config
   */
  async syncPermission() {
    const modules = PermissionConfiguration.modules;
    let permissionsList: RoutePayloadInterface[] = [];

    for (const moduleData of modules) {
      let resource = moduleData.resource;
      permissionsList = this.assignResourceAndConcatPermission(
        moduleData,
        permissionsList,
        resource
      );

      if (moduleData.hasSubmodules) {
        for (const submodule of moduleData.submodules) {
          resource = submodule.resource || resource;
          permissionsList = this.assignResourceAndConcatPermission(
            submodule,
            permissionsList,
            resource
          );
        }
      }
    }
    return this.repository.syncPermission(permissionsList);
  }

  /**
   * Get all paginated Permission
   * @param permissionFilterDto
   */
  async findAll(
    permissionFilterDto: PermissionFilterDto
  ): Promise<Pagination<Permission>> {
    return this.repository.paginate(
      permissionFilterDto,
      [],
      ['resource', 'description', 'path', 'method'],
      {
        groups: [...basicFieldGroupsForSerializing]
      }
    );
  }

  /**
   * Get Permission by id
   * @param id
   */
  async findOne(id: number): Promise<Permission> {
    return this.repository.get(id, [], {
      groups: [...basicFieldGroupsForSerializing]
    });
  }

  /**
   * Update permission by id
   * @param id
   * @param updatePermissionDto
   */
  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission> {
    const permission = await this.repository.get(id);
    const condition: ObjectLiteral = {
      description: updatePermissionDto.description
    };
    condition.id = Not(id);
    const countSameDescription = await this.repository.countEntityByCondition(
      condition
    );
    if (countSameDescription > 0) {
      throw new UnprocessableEntityException({
        property: 'name',
        constraints: {
          unique: 'already taken'
        }
      });
    }
    return this.repository.updateEntity(permission, updatePermissionDto);
  }

  /**
   * Remove permission by id
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete({ id });
  }

  /**
   * Get Permission array by provided array of id
   * @param ids
   */
  async whereInIds(ids: number[]): Promise<PermissionEntity[]> {
    return this.repository
      .createQueryBuilder('permission')
      .whereInIds(ids)
      .getMany();
  }
}
