import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { InitCryptoGameRequest } from './init-game.request';

export class CryptoSpinRequest extends OmitType(InitCryptoGameRequest, [
  'nftImage'
] as const) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clientSeed: string;
}
