import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteAccountRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'password is required' })
  readonly checkPassword: string;
}
