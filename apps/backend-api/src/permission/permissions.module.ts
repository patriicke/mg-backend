import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueValidatorPipe } from '@app/common-module';

import { PermissionsService } from '../permission/permissions.service';
import { PermissionsController } from '../permission/permissions.controller';
import { PermissionRepository } from '../permission/permission.repository';
import { AuthModule } from '../auth/auth.module';
import { PermissionEntity } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity]), AuthModule],
  exports: [PermissionsService],
  controllers: [PermissionsController],
  providers: [PermissionRepository, PermissionsService, UniqueValidatorPipe]
})
export class PermissionsModule {}
