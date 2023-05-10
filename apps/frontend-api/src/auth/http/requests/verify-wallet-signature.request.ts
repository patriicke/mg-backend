import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export enum WalletType {
  METAMASK = 'metamask',
  PHANTOM = 'phantom'
}
export class VerifyWalletSignatureDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  signature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn([WalletType.METAMASK, WalletType.PHANTOM])
  type: WalletType;
}
