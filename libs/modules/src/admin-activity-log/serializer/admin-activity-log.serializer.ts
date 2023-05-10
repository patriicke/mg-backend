import { ModelSerializer } from '@app/common-module';
import { Expose } from 'class-transformer';

export class AdminActivityLogSerializer extends ModelSerializer {
  @Expose()
  userId: number;

  @Expose()
  type: string;

  @Expose()
  module: string;

  @Expose()
  message: string;

  @Expose()
  metaData: {
    userId: number;
    courtId: number;
  };
}
