import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthService } from '../auth/auth.service';
import { UserEntity } from '../auth/entity/user.entity';
import { GetUser } from '@app/common-module';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { JwtTwoFactorGuard } from '../common/guard/jwt-two-factor.guard';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { TwofaCodeDto } from '../twofa/dto/twofa-code.dto';
import { TwofaService } from '../twofa/twofa.service';

@ApiTags('twofa')
@Controller('twofa')
export class TwofaController {
  constructor(
    private readonly twofaService: TwofaService,
    private readonly usersService: AuthService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @GetUser()
    user: UserEntity,
    @Body()
    twofaCodeDto: TwofaCodeDto
  ) {
    const isCodeValid = this.twofaService.isTwoFACodeValid(
      twofaCodeDto.code,
      user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('invalidOTP');
    }
    let refreshToken = null;
    if (req.cookies['Refresh']) {
      const { user, token } =
        await this.refreshTokenService.resolveRefreshToken(
          req.cookies['Refresh']
        );
      refreshToken = await this.refreshTokenService.generateRefreshToken(
        user,
        token,
        true
      );
    }

    const accessToken = await this.usersService.generateAccessToken(user, true);
    const cookiePayload = this.usersService.buildResponsePayload(
      accessToken,
      refreshToken
    );
    response.setHeader('Set-Cookie', cookiePayload);
    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  @Put('on')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async toggleOnTwoFa(
    @GetUser()
    user: UserEntity
  ) {
    let qrDataUri = null;

    const { otpauthUrl } = await this.twofaService.generateTwoFASecret(user);
    qrDataUri = await this.twofaService.qrDataToUrl(otpauthUrl);

    return this.usersService.turnOnTwoFactorAuthentication(
      user,
      qrDataUri,
      true
    );
  }

  @Put('off')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtTwoFactorGuard)
  async toggleOffTwoFa(
    @GetUser()
    user: UserEntity
  ) {
    return this.usersService.turnOnTwoFactorAuthentication(user, null, false);
  }
}
