import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../role/roles.service';
import { CreateRoleDto } from '../role/dto/create-role.dto';
import { UpdateRoleDto } from '../role/dto/update-role.dto';
import { RoleFilterDto } from '../role/dto/role-filter.dto';
import { RoleSerializer } from '../role/serializer/role.serializer';
import { CommonSearchFieldDto, Pagination } from '@app/common-module';
import { PermissionGuard } from '../common/guard/permission.guard';
import { JwtTwoFactorGuard } from '../common/guard/jwt-two-factor.guard';
import { BulkUpdateDto } from './dto/bulk-update.dto';
@ApiTags('roles')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Post()
  create(
    @Body()
    createRoleDto: CreateRoleDto
  ): Promise<RoleSerializer> {
    return this.rolesService.create(createRoleDto);
  }
  @Get()
  findAll(
    @Query()
    roleFilterDto: RoleFilterDto
  ): Promise<Pagination<RoleSerializer>> {
    return this.rolesService.findAll(roleFilterDto);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() dto: BulkUpdateDto) {
    return this.rolesService.bulkTransferRole(dto.fromRoleId, dto.toRoleId);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string
  ): Promise<RoleSerializer> {
    return this.rolesService.findOne(+id);
  }

  @Get(':id/users')
  findUsersWithRole(
    @Param('id')
    id: string,
    @Query()
    filter: CommonSearchFieldDto
  ) {
    return this.rolesService.getUsersWithRole(id, filter);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateRoleDto: UpdateRoleDto
  ): Promise<RoleSerializer> {
    return this.rolesService.update(+id, updateRoleDto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.rolesService.remove(+id);
  }
}
