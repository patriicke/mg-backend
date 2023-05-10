import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ModelSerializer } from '@app/common-module';

export class EmailTemplate extends ModelSerializer {
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  sender: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  target: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
