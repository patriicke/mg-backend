import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import config from 'config';
import { existsSync, unlinkSync } from 'fs';
import { SignOptions } from 'jsonwebtoken';
import { DeepPartial, Not, ObjectLiteral } from 'typeorm';
import {
  RateLimiterRes,
  RateLimiterStoreAbstract
} from 'rate-limiter-flexible';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ExceptionTitleList,
  StatusCodesList,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  CustomHttpException,
  Pagination,
  ValidationPayloadInterface
} from '@app/common-module';

import { MailJobInterface } from '../mail/interface/mail-job.interface';
import { MailService } from '../mail/mail.service';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { ForgetPasswordDto } from '../auth/dto/forget-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { UserLoginDto } from '../auth/dto/user-login.dto';
import { UserSearchFilterDto } from '../auth/dto/user-search-filter.dto';
import { UserEntity } from '../auth/entity/user.entity';
import {
  adminUserGroupsForSerializing,
  defaultUserGroupsForSerializing,
  ownerUserGroupsForSerializing,
  UserSerializer
} from '../auth/serializer/user.serializer';
import { UserStatusEnum } from '../auth/user-status.enum';
import { UserRepository } from '../auth/user.repository';
import { RefreshPaginateFilterDto } from '../refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenSerializer } from '../refresh-token/serializer/refresh-token.serializer';
import { ChangePasswordAdminDto } from './dto/change-password-admin.dto';

const MODULE_NAME = 'USER_MODULE';
const SAME_SITE_NONE_SECURE = 'SameSite=None; Secure;';
const throttleConfig = config.get('throttle.login');
const jwtConfig = config.get('jwt');
const appConfig = config.get('app');
const isSameSite =
  appConfig.sameSite !== null
    ? appConfig.sameSite
    : process.env.IS_SAME_SITE === 'true';

const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly jwt: JwtService,
    private readonly mailService: MailService,
    private readonly refreshTokenService: RefreshTokenService,
    @Inject('LOGIN_THROTTLE')
    private readonly rateLimiter: RateLimiterStoreAbstract
  ) {}

  /**
   * send mail
   * @param user
   * @param subject
   * @param url
   * @param code
   * @param linkLabel
   */
  async sendMailToUser(
    user: UserSerializer | UserEntity,
    subject: string,
    url: string,
    code: string,
    linkLabel: string
  ) {
    const link = `${appConfig.frontendUrl}/${url}`;
    const mailData: MailJobInterface = {
      to: user.email,
      subject,
      code,
      context: {
        email: user.email,
        passwordSetLink: link,
        linkLabel: linkLabel,
        username: `${user.firstName} ${user.lastName}`,
        subject
      }
    };
    await this.mailService.sendMail(mailData, 'system-mail');
  }

  /**
   * add new user
   * @param createUserDto
   */
  async create(
    createUserDto: DeepPartial<UserEntity>
  ): Promise<UserSerializer> {
    const token = await this.generateUniqueToken(12);
    // since user created from admin panel have inactive status by default, it won't go to this block
    if (!createUserDto.status) {
      createUserDto.roleId = 2;
      const currentDateTime = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 24);
      createUserDto.tokenValidityDate = currentDateTime;
    }
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 24);
    createUserDto.tokenValidityDate = currentDate;
    const registerProcess = !createUserDto.status;
    const user = await this.userRepository.store(createUserDto, token);
    const subject = registerProcess ? 'Account created' : 'Set Password';
    const link = registerProcess ? `verify/${token}` : `reset/${token}`;
    const code = registerProcess ? 'activate-account' : 'new-user-set-password';
    const linkLabel = registerProcess ? 'Activate Account' : 'Set Password';

    const serializedUser: UserSerializer = this.userRepository.transform(user);

    await this.sendMailToUser(user, subject, link, code, linkLabel);

    delete createUserDto.password;
    return serializedUser;
  }

  /**
   * find user entity by condition
   * @param field
   * @param value
   */
  async findByCondition(field: string, value: string): Promise<UserSerializer> {
    return this.userRepository.findByCondition(field, value);
  }

  /**
   * Login user by email and password
   * @param userLoginDto
   * @param refreshTokenPayload
   */
  async login(
    userLoginDto: UserLoginDto,
    refreshTokenPayload: Partial<RefreshToken>
  ): Promise<string[]> {
    const emailIPkey = `${userLoginDto.email}_${refreshTokenPayload.ip}`;
    const resEmailAndIP = await this.rateLimiter.get(emailIPkey);
    let retrySecs = 0;
    // Check if user is already blocked
    if (
      resEmailAndIP !== null &&
      resEmailAndIP.consumedPoints > throttleConfig.limit
    ) {
      retrySecs = Math.ceil(resEmailAndIP.msBeforeNext / 1000);
    }
    if (retrySecs > 0) {
      this.logger.warn(`${MODULE_NAME}<Login>`, {
        meta: {
          payload: {
            username: userLoginDto.email,
            ip: refreshTokenPayload.ip
          },
          type: 'login too many tries'
        }
      });
      throw new CustomHttpException(
        `tooManyRequest-{"second":"${String(retrySecs)}"}`,
        HttpStatus.TOO_MANY_REQUESTS,
        StatusCodesList.TooManyTries
      );
    }

    const [user, error, code] = await this.userRepository.login(userLoginDto);
    if (!user) {
      const [result, throttleError] = await this.limitConsumerPromiseHandler(
        emailIPkey
      );
      this.logger.warn(`${MODULE_NAME}<Login>`, {
        meta: {
          payload: {
            username: userLoginDto.email,
            ip: refreshTokenPayload.ip
          },
          type: 'login fail'
        }
      });
      if (!result) {
        throw new CustomHttpException(
          `tooManyRequest-{"second":${String(
            Math.ceil(throttleError.msBeforeNext / 1000)
          )}}`,
          HttpStatus.TOO_MANY_REQUESTS,
          StatusCodesList.TooManyTries
        );
      }
      throw new UnauthorizedException(error, code);
    }
    const accessToken = await this.generateAccessToken(user);
    let refreshToken = null;
    if (userLoginDto.remember) {
      refreshToken = await this.refreshTokenService.generateRefreshToken(
        user,
        refreshTokenPayload
      );
    }
    await this.rateLimiter.delete(emailIPkey);
    return this.buildResponsePayload(accessToken, refreshToken);
  }

  /**
   * Generate access token
   * @param user
   * @param isTwoFAAuthenticated
   */
  public async generateAccessToken(
    user: UserSerializer,
    isTwoFAAuthenticated = false
  ): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id)
    };
    return this.jwt.signAsync({
      ...opts,
      isTwoFAAuthenticated
    });
  }

  /**
   * promise handler to handle result and error for login
   * throttle by user
   * @param emailIPkey
   */
  async limitConsumerPromiseHandler(
    emailIPkey: string
  ): Promise<[RateLimiterRes, RateLimiterRes]> {
    return new Promise((resolve) => {
      this.rateLimiter
        .consume(emailIPkey)
        .then((rateLimiterRes) => {
          resolve([rateLimiterRes, null]);
        })
        .catch((rateLimiterError) => {
          resolve([null, rateLimiterError]);
        });
    });
  }

  /**
   * get user profile
   * @param user
   */
  async get(user: UserEntity): Promise<any> {
    return this.userRepository.transform(user, {
      groups: ownerUserGroupsForSerializing
    });
  }

  /**
   * Get user By Id
   * @param id
   */
  async findById(id: number): Promise<UserSerializer> {
    return this.userRepository.get(id, ['role'], {
      groups: [
        ...adminUserGroupsForSerializing,
        ...ownerUserGroupsForSerializing
      ]
    });
  }

  async findOne(id: number, relations: string[] = []): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { id }, relations: relations });
  }

  /**
   * Get all user paginated
   * @param userSearchFilterDto
   */
  async findAll(
    userSearchFilterDto: UserSearchFilterDto
  ): Promise<Pagination<UserSerializer>> {
    return this.userRepository.paginate(
      userSearchFilterDto,
      ['email', 'contact', 'address'],
      {
        groups: [
          ...adminUserGroupsForSerializing,
          ...ownerUserGroupsForSerializing,
          ...defaultUserGroupsForSerializing
        ]
      }
    );
  }

  /**
   * update user
   * @param id
   * @param updateUserDto
   */
  async update(
    id: number,
    updateUserDto: DeepPartial<UserEntity>
  ): Promise<UserSerializer> {
    const user = await this.userRepository.get(id, [], {
      groups: [
        ...ownerUserGroupsForSerializing,
        ...adminUserGroupsForSerializing
      ]
    });

    const checkUniqueFieldArray = ['contact'];
    const errorPayload: ValidationPayloadInterface[] = [];
    for (const field of checkUniqueFieldArray) {
      const condition: ObjectLiteral = {
        [field]: updateUserDto[field]
      };
      condition.id = Not(id);
      const checkUnique = await this.userRepository.countEntityByCondition(
        condition
      );
      if (checkUnique > 0) {
        errorPayload.push({
          property: field,
          constraints: {
            unique: 'already taken'
          }
        });
      }
    }
    if (Object.keys(errorPayload).length > 0) {
      throw new UnprocessableEntityException(errorPayload);
    }

    if (updateUserDto.avatar && user.avatar) {
      const path = `public/images/profile/${user.avatar}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/profile/${user.avatar}`);
      }
    }
    return this.userRepository.updateEntity(user, updateUserDto, ['role']);
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.get(id, [], {
      groups: [
        ...ownerUserGroupsForSerializing,
        ...adminUserGroupsForSerializing
      ]
    });

    user.email = `admin_${user.id}@app.com`;
    user.disabled = true;
    user.contact = null;
    // changing to super admin role as it wont be deleted
    user.roleId = 1;
    await this.userRepository.save(user);
  }

  /**
   * activate newly register account
   * @param token
   */
  async activateAccount(token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { token } });
    if (!user) {
      throw new NotFoundException();
    }
    if (user.status !== UserStatusEnum.INACTIVE) {
      throw new ForbiddenException(
        ExceptionTitleList.UserInactive,
        StatusCodesList.UserInactive
      );
    }
    user.status = UserStatusEnum.ACTIVE;
    user.token = await this.generateUniqueToken(6);
    user.skipHashPassword = true;
    this.logger.info(`${MODULE_NAME}<Account>`, {
      meta: {
        payload: {
          userId: user.id,
          username: user.email
        },
        type: 'account activation'
      }
    });
    await user.save();
  }

  /**
   * forget password and send reset code by email
   * @param forgetPasswordDto
   */
  async forgotPassword(forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    const { email } = forgetPasswordDto;

    const user = await this.userRepository.findOne({
      where: {
        email
      }
    });

    if (user) {
      const token = await this.generateUniqueToken(6);
      user.token = token;
      const currentDateTime = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 24);
      user.tokenValidityDate = currentDateTime;
      user.skipHashPassword = true;
      await user.save();
      const subject = 'Reset Password';
      await this.sendMailToUser(
        user,
        subject,
        `reset/${token}`,
        'reset-password',
        // subject
        `Reset Password`
      );
      this.logger.info(`${MODULE_NAME}<Forgot-Password>`, {
        meta: {
          payload: forgetPasswordDto,
          type: 'forgot password requested'
        }
      });
    }
  }

  /**
   * reset password using token
   * @param resetPasswordDto
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { password } = resetPasswordDto;
    const user = await this.userRepository.getUserForResetPassword(
      resetPasswordDto
    );
    if (!user) {
      throw new NotFoundException('invalid Reset password link');
    }

    // if no password set, new account
    if (!user.password) {
      user.status = UserStatusEnum.ACTIVE;
    }

    user.token = null;
    user.password = password;
    this.logger.info(`${MODULE_NAME}<Reset Password>`, {
      meta: {
        payload: {
          userId: user.id,
          username: user.email
        },
        type: 'reset password success'
      }
    });
    await user.save();
  }

  /**
   * change password of logged in user
   * @param user
   * @param changePasswordDto
   */
  async changePassword(
    user: UserEntity,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { oldPassword, password } = changePasswordDto;
    const checkOldPwdMatches = await user.validatePassword(oldPassword);
    if (!checkOldPwdMatches) {
      throw new CustomHttpException(
        ExceptionTitleList.IncorrectOldPassword,
        HttpStatus.PRECONDITION_FAILED,
        StatusCodesList.IncorrectOldPassword
      );
    }
    user.password = password;
    this.logger.info(`${MODULE_NAME}<Change Password>`, {
      meta: {
        payload: {
          userId: user.id,
          username: user.email
        },
        type: 'change password success'
      }
    });
    await user.save();
  }

  async resetPasswordByAdmin(
    id: number,
    changePasswordAdminDto: ChangePasswordAdminDto
  ) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    });

    if (!user) {
      this.logger.error(`${MODULE_NAME}<Reset Password By Admin>`, {
        meta: {
          payload: { id: id },
          type: 'User not found'
        }
      });
      throw new NotFoundException('UserNotFound');
    }

    if (!user.password) {
      user.status = UserStatusEnum.ACTIVE;
    }
    user.password = changePasswordAdminDto.password;

    await user.save();
  }

  /**
   * generate random string code providing length
   * @param length
   * @param uppercase
   * @param lowercase
   * @param numerical
   */
  generateRandomCode(
    length: number,
    uppercase = true,
    lowercase = true,
    numerical = true
  ): string {
    let result = '';
    const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericalLetters = '0123456789';
    let characters = '';
    if (uppercase) {
      characters += upperCaseAlphabets;
    }
    if (lowercase) {
      characters += lowerCaseAlphabets;
    }
    if (numerical) {
      characters += numericalLetters;
    }
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * generate unique token
   * @param length
   */
  async generateUniqueToken(length: number): Promise<string> {
    const token = this.generateRandomCode(length);
    const condition: ObjectLiteral = {
      token
    };
    const tokenCount = await this.userRepository.countEntityByCondition(
      condition
    );
    if (tokenCount > 0) {
      await this.generateUniqueToken(length);
    }
    return token;
  }

  /**
   * Get cookie for logout action
   */
  getCookieForLogOut(): string[] {
    return [
      `Authentication=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? SAME_SITE_NONE_SECURE : ''
      }`,
      `Refresh=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? SAME_SITE_NONE_SECURE : ''
      }`,
      `ExpiresIn=; Path=/; Max-Age=0; ${
        !isSameSite ? SAME_SITE_NONE_SECURE : ''
      }`
    ];
  }

  /**
   * build response payload
   * @param accessToken
   * @param refreshToken
   */
  buildResponsePayload(accessToken: string, refreshToken?: string): string[] {
    let tokenCookies = [
      `Authentication=${accessToken}; HttpOnly; Path=/; ${
        !isSameSite ? SAME_SITE_NONE_SECURE : ''
      } Max-Age=${jwtConfig.cookieExpiresIn}`
    ];
    if (refreshToken) {
      const expiration = new Date();
      expiration.setSeconds(expiration.getSeconds() + jwtConfig.expiresIn);
      tokenCookies = tokenCookies.concat([
        `Refresh=${refreshToken}; HttpOnly; Path=/; ${
          !isSameSite ? SAME_SITE_NONE_SECURE : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`,
        `ExpiresIn=${expiration}; Path=/; ${
          !isSameSite ? SAME_SITE_NONE_SECURE : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`
      ]);
    }
    return tokenCookies;
  }

  /**
   * Create access token from refresh token
   * @param refreshToken
   */
  async createAccessTokenFromRefreshToken(refreshToken: string) {
    const { _token } =
      await this.refreshTokenService.createAccessTokenFromRefreshToken(
        refreshToken
      );
    return this.buildResponsePayload(_token);
  }

  /**
   * revoke refresh token for logout action
   * @param encoded
   */
  async revokeRefreshToken(encoded: string): Promise<void> {
    // ignore exception because anyway we are going invalidate cookies
    try {
      const { token } = await this.refreshTokenService.resolveRefreshToken(
        encoded
      );
      if (token) {
        token.isRevoked = true;
        await token.save();
      }
    } catch (e) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.PRECONDITION_FAILED,
        StatusCodesList.InvalidRefreshToken
      );
    }
  }

  /**
   * get active refresh token list for user
   * @param userId
   * @param filter
   **/
  activeRefreshTokenList(
    userId: number,
    filter: RefreshPaginateFilterDto
  ): Promise<Pagination<RefreshTokenSerializer>> {
    return this.refreshTokenService.getRefreshTokenByUserId(userId, filter);
  }

  /**
   * revoke token by id
   * @param id
   * @param userId
   **/
  revokeTokenById(id: number, userId: number): Promise<RefreshToken> {
    return this.refreshTokenService.revokeRefreshTokenById(id, userId);
  }

  /**
   * set two factor auth secret for user
   * @param secret
   * @param userId
   **/
  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    // add one minute throttle to generate next two factor token
    const twoFAThrottleTime = new Date();
    twoFAThrottleTime.setSeconds(twoFAThrottleTime.getSeconds() + 60);
    return this.userRepository.update(userId, {
      twoFASecret: secret,
      twoFAThrottleTime
    });
  }

  /**
   * Turn two factor authentication for user
   * @param user
   * @param isTwoFAEnabled
   * @param qrDataUri
   **/
  async turnOnTwoFactorAuthentication(
    user: UserEntity,
    qrDataUri: string,
    isTwoFAEnabled: boolean
  ) {
    if (isTwoFAEnabled) {
      const subject = 'Activate Two Factor Authentication';
      const mailData: MailJobInterface = {
        to: user.email,
        subject,
        code: 'two-factor-authentication',
        context: {
          email: user.email,
          qrcode: 'cid:2fa-qrcode',
          username: `${user.firstName} ${user.lastName}`,
          subject
        },
        attachments: [
          {
            filename: '2fa-qrcode.png',
            path: qrDataUri,
            cid: '2fa-qrcode'
          }
        ]
      };
      await this.mailService.sendMail(mailData, 'system-mail');
    }
    this.logger.info(`${MODULE_NAME}<enable 2FA>`, {
      meta: {
        payload: {
          userId: user.id,
          username: user.email
        },
        type: 'enable 2FA'
      }
    });
    return this.userRepository.update(user.id, {
      isTwoFAEnabled
    });
  }

  /**
   * Count data by condition
   * @param condition
   **/
  async countByCondition(condition: ObjectLiteral) {
    return this.userRepository.countEntityByCondition(condition);
  }

  async getRefreshTokenGroupedData(field: string) {
    return this.refreshTokenService.getRefreshTokenGroupedData(field);
  }

  async bulkTransferRole(fromRoleId: number, toRoleId: number) {
    return this.userRepository.update(
      { roleId: fromRoleId },
      { roleId: toRoleId }
    );
  }
}
