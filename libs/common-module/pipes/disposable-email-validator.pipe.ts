import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import fakeDomains from '../fake-mail-domain/fake-mail-domain';

@ValidatorConstraint({
  name: 'disposableEmail'
})
@Injectable()
export class DisposableEmailValidator implements ValidatorConstraintInterface {
  public async validate(email: string) {
    const domain = email.split('@')[1];
    const isDisposable = fakeDomains[domain];
    return !isDisposable;
  }

  /**
   * default message
   * @param args
   */
  public defaultMessage() {
    return 'Disposable email domains are not allowed';
  }
}
