import { ChangeType } from '@app/modules/nft-game';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  ValidateIf
} from 'class-validator';
const changeTypeArray = [ChangeType.BET_AMOUNT, ChangeType.WIN_PROBABILITY];
export class InitGameRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  chain: string;

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
  @Max(100)
  winProbability: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  betAmount: number;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.nftImage)
  @IsString()
  nftImage: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.changeType)
  @IsIn(changeTypeArray, {
    message: `changeType must be one of ${changeTypeArray.join(', ')}`
  })
  changeType: ChangeType;
}
