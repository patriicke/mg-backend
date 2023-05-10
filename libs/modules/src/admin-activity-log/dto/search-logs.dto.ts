import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommonSearchFieldDto } from '@app/common-module';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsString,
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions
} from 'class-validator';

function BothPresent(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'bothPresent',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if ((value && !relatedValue) || (!value && relatedValue)) {
            return false;
          }
          return true;
        },

        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `$property and ${relatedPropertyName} both should either be present or not present`;
        }
      }
    });
  };
}

export class SearchLogsDto extends CommonSearchFieldDto {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @Transform(({ value }) => Number.parseInt(value), {
    toClassOnly: true
  })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  module: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @Transform(({ value }) => new Date(value), {
    toClassOnly: true
  })
  @BothPresent('dateTo')
  dateFrom: Date;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @Transform(({ value }) => new Date(value), {
    toClassOnly: true
  })
  @BothPresent('dateFrom')
  @Transform(
    ({ value }) =>
      new Date(new Date(value).setDate(new Date(value).getDate() + 1))
  )
  dateTo: Date;
}
