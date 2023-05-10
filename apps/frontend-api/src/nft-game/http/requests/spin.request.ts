import { ChangeType } from '@app/modules/nft-game';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
const changeTypeArray = [ChangeType.BET_AMOUNT, ChangeType.WIN_PROBABILITY];
export class SpinRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clientSeed: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tokenId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nftAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  winProbability: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  betAmount: number;

  @ApiProperty()
  @IsIn(changeTypeArray, {
    message: `changeType must be one of ${changeTypeArray.join(', ')}`
  })
  changeType: ChangeType;
}
