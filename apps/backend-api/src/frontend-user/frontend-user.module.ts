import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FrontendUser,
  FrontendUserRepository,
  FrontendUserService
} from '@app/modules/frontend-user';
import { FrontendUserController } from './frontend-user.controller';

import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FrontendUser]), CommonModule, AuthModule],
  controllers: [FrontendUserController],
  providers: [FrontendUserRepository, FrontendUserService],
  exports: [FrontendUserService]
})
export class FrontendUserModule {}
