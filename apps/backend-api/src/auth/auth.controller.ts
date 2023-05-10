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
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';
import {
  GetUser,
  IpAddress,
  multerOptionsHelper,
  Pagination
} from '@app/common-module';

import { JwtTwoFactorGuard } from '../common/guard/jwt-two-factor.guard';
import { PermissionGuard } from '../common/guard/permission.guard';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { AuthService } from '../auth/auth.service';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { ForgetPasswordDto } from '../auth/dto/forget-password.dto';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { UpdateUserProfileDto } from '../auth/dto/update-user-profile.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { UserLoginDto } from '../auth/dto/user-login.dto';
import { UserSearchFilterDto } from '../auth/dto/user-search-filter.dto';
import { UserEntity } from '../auth/entity/user.entity';
import { UserSerializer } from '../auth/serializer/user.serializer';
import { RefreshPaginateFilterDto } from '../refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenSerializer } from '../refresh-token/serializer/refresh-token.serializer';
import { ChangePasswordAdminDto } from './dto/change-password-admin.dto';
const SET_COOKIE = 'Set-Cookie';
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiExcludeEndpoint()
  @Post('/auth/register')
  register(
    @Body(ValidationPipe)
    registerUserDto: RegisterUserDto
  ): Promise<UserSerializer> {
    return this.authService.create(registerUserDto);
  }

  @ApiTags('auth')
  @Post('/auth/login')
  async login(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @Body()
    userLoginDto: UserLoginDto,
    @IpAddress() ipAddress
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<RefreshToken> = {
      ip: ipAddress,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name
    };
    const cookiePayload = await this.authService.login(
      userLoginDto,
      refreshTokenPayload
    );
    response.setHeader(SET_COOKIE, cookiePayload);
    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  @ApiTags('auth')
  @Post('/refresh')
  async refresh(
    @Req()
    req: Request,
    @Res()
    response: Response
  ) {
    try {
      const cookiePayload =
        await this.authService.createAccessTokenFromRefreshToken(
          req.cookies['Refresh']
        );
      response.setHeader(SET_COOKIE, cookiePayload);
      return response.status(HttpStatus.NO_CONTENT).json({});
    } catch (e) {
      response.setHeader(SET_COOKIE, this.authService.getCookieForLogOut());
      return response.sendStatus(HttpStatus.BAD_REQUEST);
    }
  }

  @ApiExcludeEndpoint()
  @ApiTags('auth')
  @Get('/auth/activate-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  activateAccount(
    @Query('token')
    token: string
  ): Promise<void> {
    return this.authService.activateAccount(token);
  }

  @ApiTags('auth')
  @Put('/auth/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(
    @Body()
    forgetPasswordDto: ForgetPasswordDto
  ): Promise<void> {
    return this.authService.forgotPassword(forgetPasswordDto);
  }

  @ApiTags('auth')
  @Put('/auth/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(
    @Body()
    resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiTags('auth')
  @UseGuards(JwtTwoFactorGuard)
  @Get('/auth/profile')
  profile(
    @GetUser()
    user: UserEntity
  ): Promise<UserSerializer> {
    return this.authService.get(user);
  }

  @ApiTags('auth')
  @UseGuards(JwtTwoFactorGuard)
  @Put('/auth/profile')
  @UseInterceptors(
    FileInterceptor(
      'avatar',
      multerOptionsHelper('public/images/profile', 1000000)
    )
  )
  updateProfile(
    @GetUser()
    user: UserEntity,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    updateUserDto: UpdateUserProfileDto
  ): Promise<UserSerializer> {
    return this.authService.update(user.id, updateUserDto);
  }

  @ApiTags('auth')
  @UseGuards(JwtTwoFactorGuard)
  @Put('/auth/change-password')
  changePassword(
    @GetUser()
    user: UserEntity,
    @Body()
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @ApiTags('users')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get('/users')
  findAll(
    @Query()
    userSearchFilterDto: UserSearchFilterDto
  ): Promise<Pagination<UserSerializer>> {
    return this.authService.findAll(userSearchFilterDto);
  }

  @ApiTags('users')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post('/users')
  create(
    @Body(ValidationPipe)
    createUserDto: CreateUserDto
  ): Promise<UserSerializer> {
    return this.authService.create(createUserDto);
  }

  @ApiTags('users')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Put('/users/:id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateUserDto: UpdateUserDto
  ): Promise<UserSerializer> {
    return this.authService.update(+id, updateUserDto);
  }

  @ApiTags('users')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Delete('/users/:id')
  async delete(
    @Param('id')
    id: string,
    @Res()
    response: Response
  ) {
    await this.authService.delete(+id);
    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  @ApiTags('users')
  @Put('/users/reset-password/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  resetPasswordByAdmin(
    @Param('id') id: string,
    @Body()
    changePasswordDto: ChangePasswordAdminDto
  ): Promise<void> {
    return this.authService.resetPasswordByAdmin(+id, changePasswordDto);
  }

  @ApiTags('users')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get('/users/:id')
  findOne(
    @Param('id')
    id: string
  ): Promise<UserSerializer> {
    return this.authService.findById(+id);
  }

  @ApiTags('auth')
  @Post('/logout')
  async logOut(
    @Req()
    req: Request,
    @Res()
    response: Response
  ) {
    try {
      const refreshCookie = req.cookies['Refresh'];
      if (refreshCookie) {
        await this.authService.revokeRefreshToken(req.cookies['Refresh']);
      }
      response.setHeader(SET_COOKIE, this.authService.getCookieForLogOut());
      return response.sendStatus(HttpStatus.NO_CONTENT);
    } catch (e) {
      response.setHeader(SET_COOKIE, this.authService.getCookieForLogOut());
      return response.sendStatus(HttpStatus.NO_CONTENT);
    }
  }
  @ApiExcludeEndpoint()
  @ApiTags('auth')
  @UseGuards(JwtTwoFactorGuard)
  @Get('/auth/token-info')
  getRefreshToken(
    @Query()
    filter: RefreshPaginateFilterDto,
    @GetUser()
    user: UserEntity
  ): Promise<Pagination<RefreshTokenSerializer>> {
    return this.authService.activeRefreshTokenList(+user.id, filter);
  }

  @ApiExcludeEndpoint()
  @ApiTags('auth')
  @UseGuards(JwtTwoFactorGuard)
  @Put('/revoke/:id')
  revokeToken(
    @Param('id')
    id: string,
    @GetUser()
    user: UserEntity
  ) {
    return this.authService.revokeTokenById(+id, user.id);
  }
}
