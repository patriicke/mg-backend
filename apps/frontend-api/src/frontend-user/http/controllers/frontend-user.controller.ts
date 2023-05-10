import { Controller, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common-module/index';
@UseGuards(JwtAuthGuard)
@Controller('frontendUser')
@ApiTags('frontendUser')
@ApiBearerAuth()
export class FrontendUserController {
  constructor(private readonly queryBus: QueryBus) {}

  // @ApiTags('FrontendUser')
  // @Get()
  // async getFrontendUserByUserName(
  //   @Query() query: FetchFrontendUserByUsernameRequest
  // ) {
  //   const user = await this.queryBus.execute(
  //     FindFrontendUserInfo.byEmailUsername(query.username, true)
  //   );
  //   return this.transform({ ...user }, ['basic']);
  // }

  // private transform(FrontendUser, groups = []) {
  //   return plainToInstance(FrontendUserSerializer, FrontendUser, {
  //     excludeExtraneousValues: true,
  //     groups
  //   });
  // }
}
