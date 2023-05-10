import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FetchFrontendUserByUsernameRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;
}
