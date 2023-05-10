import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  registerDecorator,
  ValidationArguments,
  ValidationOptions
} from 'class-validator';

export function IsNotEqualTo(
  property: string,
  validationOptions?: ValidationOptions
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isNotEqualTo',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value !== relatedValue;
        },

        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `$property must not match ${relatedPropertyName}`;
        }
      }
    });
  };
}

export class BulkUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  fromRoleId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsNotEqualTo('fromRoleId', {
    message: 'isNotEqualTo-{"field":"fromRoleId"}'
  })
  toRoleId: number;
}
