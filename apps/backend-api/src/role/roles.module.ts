import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueValidatorPipe } from '@app/common-module';

import { RolesService } from '../role/roles.service';
import { RolesController } from '../role/roles.controller';
import { RoleRepository } from '../role/role.repository';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permission/permissions.module';
import { RoleEntity } from './entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
    AuthModule,
    PermissionsModule
  ],
  exports: [],
  controllers: [RolesController],
  providers: [RoleRepository, RolesService, UniqueValidatorPipe]
})
export class RolesModule {}
