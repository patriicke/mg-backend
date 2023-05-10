import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FrontendUserService } from '@app/modules/frontend-user';
import { SearchFrontendUserDto } from './dto/search-frontend-user.dto';
import { JwtTwoFactorGuard } from '../common/guard/jwt-two-factor.guard';
import { PermissionGuard } from '../common/guard/permission.guard';

@ApiBearerAuth()
@ApiTags('frontendUser')
@Controller('frontend-user')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class FrontendUserController {
  constructor(private readonly service: FrontendUserService) {}

  @Get()
  findAll(@Query() searchFrontendUserDto: SearchFrontendUserDto) {
    return this.service.findAll(searchFrontendUserDto);
  }

  @Get('export')
  async exportCustomers(@Res() res: Response) {
    const file = await this.service.exportFrontendUser();
    return res.download(`${file}`, 'FrontendUser.xlsx');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch('disable/:id')
  disable(@Param('id') id: string) {
    return this.service.toggleDisable(+id);
  }

  // @Post('reset-password/:id')
  // resetPassword(@Param('id') id: string, @Body() body: ResetPasswordDto) {
  //   return this.service.resetPassword(+id, body);
  // }
}
