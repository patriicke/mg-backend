import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, ValidateIf } from 'class-validator';

export class ReferralByDto {
  @ApiPropertyOptional()
  @IsString()
  @ValidateIf((object, value) => value)
  // @Length(8, 8, { message: 'Invalid referral code' })
  referralCode: string;
}
