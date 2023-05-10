import {
  HttpException,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import { Not, ObjectLiteral } from 'typeorm';

import {
  NotFoundException,
  CommonServiceInterface,
  Pagination,
  CommonSearchFieldDto
} from '@app/common-module';

import { CreateRoleDto } from '../role/dto/create-role.dto';
import { UpdateRoleDto } from '../role/dto/update-role.dto';
import { RoleRepository } from '../role/role.repository';
import { RoleFilterDto } from '../role/dto/role-filter.dto';
import {
  adminUserGroupsForSerializing,
  basicFieldGroupsForSerializing,
  RoleSerializer
} from '../role/serializer/role.serializer';
import { PermissionsService } from '../permission/permissions.service';
import { AuthService } from '../auth/auth.service';
import { PermissionEntity } from '../permission/entities/permission.entity';

@Injectable()
export class RolesService implements CommonServiceInterface<RoleSerializer> {
  constructor(
    private readonly repository: RoleRepository,
    private readonly permissionsService: PermissionsService,
    private readonly authService: AuthService
  ) {}

  /**
   * Get Permission Id array
   * @param ids
   */
  getPermissionByIds(ids): Promise<PermissionEntity[]> {
    if (ids && ids.length > 0) {
      return this.permissionsService.whereInIds(ids);
    }
    return null;
  }

  getUsersWithRole(id: string, filter: CommonSearchFieldDto) {
    return this.authService.findAll({ ...filter, roleId: id });
  }

  /**
   * Find by name
   * @param name
   */
  findByName(name: string) {
    return this.repository.findOne({
      where: {
        name
      }
    });
  }

  /**
   * create new role
   * @param createRoleDto
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    const { permissions } = createRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    const role = await this.repository.store(createRoleDto, permission || []);

    return role;
  }

  /**
   * find and return collection of roles
   * @param roleFilterDto
   */
  async findAll(
    roleFilterDto: RoleFilterDto
  ): Promise<Pagination<RoleSerializer>> {
    return this.repository.paginate(
      roleFilterDto,
      [],
      ['name', 'description'],
      {
        groups: [
          ...adminUserGroupsForSerializing,
          ...basicFieldGroupsForSerializing
        ]
      }
    );
  }

  /**
   * find role by id
   * @param id
   */
  async findOne(id: number): Promise<RoleSerializer> {
    return this.repository.get(id, ['permission'], {
      groups: [
        ...adminUserGroupsForSerializing,
        ...basicFieldGroupsForSerializing
      ]
    });
  }

  /**
   * update role by id
   * @param id
   * @param updateRoleDto
   */
  async update(
    id: number,
    updateRoleDto: UpdateRoleDto
  ): Promise<RoleSerializer> {
    const role = await this.repository.findOne({
      where: {
        id
      }
    });
    if (!role) {
      throw new NotFoundException();
    }
    const condition: ObjectLiteral = {
      name: updateRoleDto.name
    };
    condition.id = Not(id);
    const checkUniqueTitle = await this.repository.countEntityByCondition(
      condition
    );
    if (checkUniqueTitle > 0) {
      throw new UnprocessableEntityException({
        property: 'name',
        constraints: {
          unique: 'already taken'
        }
      });
    }
    const { permissions } = updateRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    const updatedRole = await this.repository.updateItem(
      role,
      updateRoleDto,
      permission || []
    );

    return updatedRole;
  }

  /**
   * remove role by id
   * @param id
   */
  async remove(id: number): Promise<void> {
    // to check if data found
    const role = await this.repository.findOne({
      where: {
        id
      },
      relations: ['users', 'users.role']
    });
    if (!role) {
      throw new NotFoundException('Not Found');
    }
    if (role.users.length > 0) {
      const users = role.users.map((user) => {
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role.name
        };
      });
      throw new HttpException(
        {
          message: 'roleInUse',
          users
        },
        400
      );
    }
    await this.repository.delete({ id });
  }

  async bulkTransferRole(fromRoleId: number, toRoleId: number) {
    const [fromRole, toRole] = await Promise.all([
      this.repository.findOne({
        where: {
          id: fromRoleId
        }
      }),
      this.repository.findOne({
        where: {
          id: toRoleId
        }
      })
    ]);
    if (!fromRole) {
      throw new NotFoundException('fromRoleNotFound');
    }
    if (!toRole) {
      throw new NotFoundException('toRoleNotFound');
    }
    await this.authService.bulkTransferRole(fromRoleId, toRoleId);
  }
}
