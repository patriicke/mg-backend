import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FrontendUserRepository } from '@app/modules/frontend-user';
import { v4 as uuidv4 } from 'uuid';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import { VerifySignedMessage } from './verify-signed-message';
import { UnauthorizedException } from '@nestjs/common';
import { FeRefreshTokenService } from '@app/modules/fe-refresh-token';
import { WalletType } from '../../auth/http/requests/verify-wallet-signature.request';

@CommandHandler(VerifySignedMessage)
export class VerifySignedMessageHandler
  implements ICommandHandler<VerifySignedMessage>
{
  constructor(
    private readonly tokenService: FeRefreshTokenService,
    readonly repository: FrontendUserRepository,
    readonly commandBus: CommandBus
  ) {}
  async execute(command: VerifySignedMessage): Promise<string[]> {
    const { address, signature, type } = command;
    const user = await this.repository.findOneBy({
      ...(type === WalletType.METAMASK && { address }),
      ...(type === WalletType.PHANTOM && { phantomAddress: address })
    });
    let validSignature: boolean;
    if (user) {
      const identifier = uuidv4();
      switch (type) {
        case WalletType.METAMASK:
          validSignature = this.checkMetaMaskSignature(
            signature,
            user.identifier,
            address
          );
          break;
        case WalletType.PHANTOM:
          validSignature = this.checkPhantomSignature(
            signature,
            user.identifier,
            address
          );
          break;
      }

      if (validSignature) {
        await this.repository.updateEntity(user, {
          identifier
        });
        const accessToken = await this.tokenService.generateAccessToken(user);
        const refreshToken = await this.tokenService.generateRefreshToken(
          user,
          command.refreshTokenPayload
        );
        return this.tokenService.buildResponsePayload(
          accessToken,
          refreshToken
        );
      }
    }
    throw new UnauthorizedException('Invalid signature');
  }

  private checkMetaMaskSignature(
    signature: string,
    identifier: string,
    address: string
  ) {
    const recoveredAddress = recoverPersonalSignature({
      data: `0x${this.toHex(identifier)}`,
      signature
    });
    return address === recoveredAddress;
  }

  private checkPhantomSignature(
    signature: string,
    identifier: string,
    address: string
  ) {
    try {
      const result = nacl.sign.detached.verify(
        new TextEncoder().encode(identifier),
        bs58.decode(signature),
        bs58.decode(address)
      );
      return result;
    } catch (e) {
      return false;
    }
  }

  private toHex(stringToConvert: string) {
    return stringToConvert
      .split('')
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }
}
