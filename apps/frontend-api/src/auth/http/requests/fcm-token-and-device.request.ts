import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FCMTokenAndDeviceIdRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fcmToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceInfo: string;
}
