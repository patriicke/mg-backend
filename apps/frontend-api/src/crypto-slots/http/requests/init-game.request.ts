import { ApiProperty, OmitType } from '@nestjs/swagger';
import { InitGameRequest } from '../../../nft-game/http/requests/init-game.request';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class InitCryptoGameRequest extends OmitType(InitGameRequest, [
  'chain',
  'nftAddress'
] as const) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  symbol: string;
}
