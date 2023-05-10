import { Injectable } from '@nestjs/common';
import { ValidatorConstraint } from 'class-validator';
import { DataSource } from 'typeorm';

import { AbstractUniqueValidator } from '../pipes/abstract-unique-validator';

/**
 * unique validator pipe
 */
@ValidatorConstraint({
  name: 'unique',
  async: true
})
@Injectable()
export class UniqueValidatorPipe extends AbstractUniqueValidator {
  constructor(protected readonly connection: DataSource) {
    super(connection);
  }
}
