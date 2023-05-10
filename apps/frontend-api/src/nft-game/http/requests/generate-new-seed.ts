import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateNewSeedRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clientSeed: string;
}
