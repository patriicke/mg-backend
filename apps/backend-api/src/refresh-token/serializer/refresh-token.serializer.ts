import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '@app/common-module';

export class RefreshTokenSerializer extends ModelSerializer {
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  ip: string;

  @ApiProperty()
  userAgent: string;

  @ApiProperty()
  browser: string;

  @ApiProperty()
  os: string;

  @ApiProperty()
  isRevoked: boolean;

  @ApiProperty()
  expires: Date;
}
