import { Module } from '@nestjs/common';
import { S3HelperService } from './s3-helper.service';

@Module({
  providers: [S3HelperService],
  exports: [S3HelperService]
})
export class S3HelperModule {}
