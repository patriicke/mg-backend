import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
export class GoogleLoginRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.referralCode)
  @IsString()
  readonly referralCode: string;
}
