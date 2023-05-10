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
import { Pagination } from '@app/common-module';

import { PermissionsService } from '../permission/permissions.service';
import { CreatePermissionDto } from '../permission/dto/create-permission.dto';
import { UpdatePermissionDto } from '../permission/dto/update-permission.dto';
import { PermissionFilterDto } from '../permission/dto/permission-filter.dto';
import { Permission } from '../permission/serializer/permission.serializer';
import { PermissionGuard } from '../common/guard/permission.guard';
import { JwtTwoFactorGuard } from '../common/guard/jwt-two-factor.guard';

@ApiTags('permissions')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('permissions')
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @Post()
  create(
    @Body()
    createPermissionDto: CreatePermissionDto
  ): Promise<Permission> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  // @ApiQuery({
  //   type: PermissionFilterDto
  // })
  findAll(
    @Query()
    permissionFilterDto: PermissionFilterDto
  ): Promise<Pagination<Permission>> {
    return this.permissionsService.findAll(permissionFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string
  ): Promise<Permission> {
    return this.permissionsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission> {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.permissionsService.remove(+id);
  }

  @Post('/sync')
  @HttpCode(HttpStatus.NO_CONTENT)
  syncPermission(): Promise<void> {
    return this.permissionsService.syncPermission();
  }
}
