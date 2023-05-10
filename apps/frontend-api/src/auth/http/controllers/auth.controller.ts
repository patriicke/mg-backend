import { plainToInstance } from 'class-transformer';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  DeleteUploadsOnErrorInterceptor,
  GetUser,
  IpAddress,
  JwtAuthGuard,
  multerOptionsHelper
} from '@app/common-module';
import {
  FrontendUser,
  FrontendUserRepository,
  FrontendUserSerializer
} from '@app/modules/frontend-user';

import { RegisterRequest } from '../requests/register.request';
import { UpdateUserProfile } from '../../../frontend-user/commands/update-user-profile';
import { LoginRequest } from '../requests/login.request';
import { LoginFrontendUser } from '../../../frontend-user/commands/login-frontend-user';
import { RegisterFrontendUser } from '../../../frontend-user/commands/register-frontend-user';
import { UpdateUserProfileRequest } from '../requests/update-user-profile.request';
import {
  FeRefreshToken,
  FeRefreshTokenService
} from '@app/modules/fe-refresh-token';
import UAParser from 'ua-parser-js';
import { GetIdentifier } from '../../../frontend-user/commands/get-identifier';
import { FeRefreshTokenFeCommand } from '../../../frontend-user/commands/refresh-token-fe';
import { FeLogoutCommand } from '../../../frontend-user/commands/logout-fe';
import { VerifySignedMessage } from '../../../frontend-user/commands/verify-signed-message';
import { FetchUserIdentifierDto } from '../requests/fetch-user-identifier.request';
import { ReferralByDto } from '../requests/referral-by.request';
import { VerifyWalletSignatureDto } from '../requests/verify-wallet-signature.request';
import { FetchIdentifierBodyDto } from '../requests/fetch-identifier-body.request';
import { GoogleLoginRequest } from '../requests/login-with-google.request';
import { GoogleLoginFrontendUser } from '../../../frontend-user/commands/login-with-google';
import { DefaultProfileImages } from '../../../frontend-user/queries/get-default-profile-images';
const SET_COOKIE = 'Set-Cookie';
@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    readonly commandBus: CommandBus,
    readonly queryBus: QueryBus,
    readonly refreshTokenService: FeRefreshTokenService,
    readonly frontendUserRepository: FrontendUserRepository
  ) {}

  @Post('/wallet/:address/identifier')
  getIdentifier(
    @Param() requestDto: FetchUserIdentifierDto,
    @Query() referredBy: ReferralByDto,
    @Body() body: FetchIdentifierBodyDto
  ) {
    return this.commandBus.execute(
      new GetIdentifier(requestDto.address, referredBy.referralCode, body.type)
    );
  }

  @Post('wallet/verify')
  @HttpCode(HttpStatus.OK)
  async verifySignature(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @IpAddress() ipAddress,
    @Body() requestDto: VerifyWalletSignatureDto
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<FeRefreshToken> = {
      ip: ipAddress,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name
    };
    const cookiePayload = await this.commandBus.execute(
      new VerifySignedMessage(
        requestDto.address,
        requestDto.signature,
        requestDto.type,
        refreshTokenPayload
      )
    );
    response.setHeader(SET_COOKIE, cookiePayload);
    return response.json({ success: true });
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @IpAddress() ipAddress,
    @Body(ValidationPipe) body: RegisterRequest
  ) {
    const data = await this.commandBus.execute(
      new RegisterFrontendUser(body.sendToken, {
        email: body.email,
        username: body.username,
        password: body.password,
        referralCode: body.referralCode,
        token: body.token
      })
    );
    if (!body.sendToken) {
      const ua = UAParser(req.headers['user-agent']);
      const refreshTokenPayload: Partial<FeRefreshToken> = {
        ip: ipAddress,
        userAgent: JSON.stringify(ua),
        browser: ua.browser.name,
        os: ua.os.name
      };
      const cookiePayload = await this.commandBus.execute(
        new LoginFrontendUser(
          {
            email: body.email,
            password: body.password
          },
          refreshTokenPayload
        )
      );
      response.setHeader(SET_COOKIE, cookiePayload);
    }
    return response.json(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @IpAddress() ipAddress,
    @Body(ValidationPipe) body: LoginRequest
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<FeRefreshToken> = {
      ip: ipAddress,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name
    };
    const cookiePayload = await this.commandBus.execute(
      new LoginFrontendUser(
        {
          email: body.email,
          password: body.password
        },
        refreshTokenPayload
      )
    );
    response.setHeader(SET_COOKIE, cookiePayload);
    return response.status(HttpStatus.OK).json({
      meta: {
        api: {
          version: '0.0.1'
        }
      },
      data: { msg: 'Login Success' }
    });
  }

  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @IpAddress() ipAddress,
    @Body(ValidationPipe) body: GoogleLoginRequest
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<FeRefreshToken> = {
      ip: ipAddress,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name
    };
    const cookiePayload = await this.commandBus.execute(
      new GoogleLoginFrontendUser(
        body.token,
        body.referralCode,
        refreshTokenPayload
      )
    );
    response.setHeader(SET_COOKIE, cookiePayload);
    return response.json({ success: true });
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res() response: Response) {
    try {
      const cookiePayload = await this.commandBus.execute(
        new FeRefreshTokenFeCommand(req.cookies['Fe_Refresh'])
      );
      response.setHeader(SET_COOKIE, cookiePayload);
      return response.status(HttpStatus.NO_CONTENT).json({});
    } catch (err) {
      response.setHeader(
        SET_COOKIE,
        this.refreshTokenService.getCookieForLogOut()
      );
      return response.status(HttpStatus.BAD_REQUEST).json({});
    }
  }

  @ApiBearerAuth()
  @Get('/profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async profile(@GetUser() user: FrontendUser) {
    return this.transform(user, ['basic']);
  }

  @ApiBearerAuth()
  @Get('/profile/default-pics')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async profileDefaultpics() {
    return this.queryBus.execute(new DefaultProfileImages());
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Patch('/profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'avatar',
      multerOptionsHelper('public/images/frontend-profile/', 10000000)
    ),
    DeleteUploadsOnErrorInterceptor
  )
  async updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: FrontendUser,
    @Body(ValidationPipe) body: UpdateUserProfileRequest
  ) {
    const dto = { ...body, avatar: undefined };
    if (file) {
      dto.avatar = file.filename;
    }
    const userdata = await this.commandBus.execute(
      new UpdateUserProfile(user, dto)
    );
    return this.transform(userdata, ['basic']);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() response: Response) {
    try {
      await this.commandBus.execute(
        new FeLogoutCommand(req.cookies['Fe_Refresh'])
      );
      response.setHeader(
        SET_COOKIE,
        this.refreshTokenService.getCookieForLogOut()
      );
      return response.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      response.setHeader(
        SET_COOKIE,
        this.refreshTokenService.getCookieForLogOut()
      );
      return response.status(HttpStatus.NO_CONTENT).json({});
    }
  }

  private transform(FrontendUser, groups = []) {
    return plainToInstance(FrontendUserSerializer, FrontendUser, {
      groups
    });
  }
}
