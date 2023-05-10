import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FetchUserIdentifierDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string;
}
