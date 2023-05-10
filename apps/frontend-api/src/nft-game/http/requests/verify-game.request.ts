import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyGameRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serverSeed: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clientSeed: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  winProbability: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nonce: string;
}
