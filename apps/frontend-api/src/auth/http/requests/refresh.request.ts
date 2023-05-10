import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshRequest {
  @ApiProperty()
  @IsNotEmpty()
  readonly refreshToken: string;
}
