import { Inject, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import config from 'config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

const s3Config = config.get('s3');
@Injectable()
export class S3HelperService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger
  ) {}
  async uploadFile(
    dataBuffer: Buffer,
    fileName: string,
    folder: string
  ): Promise<string> {
    try {
      const s3 = new S3();
      const uploadResult = await s3
        .upload({
          Bucket: s3Config.awsBucketName,
          Body: dataBuffer,
          Key: `${folder}/${fileName}`
        })
        .promise();
      return uploadResult.Key;
    } catch (error) {
      this.logger.error('S3_MODULE<UPLOAD_IMAGE>', {
        meta: {
          error
        }
      });
    }
  }

  async removeFile(path: string) {
    try {
      const s3 = new S3();

      await s3
        .deleteObject({
          Bucket: s3Config.awsBucketName,
          Key: path
        })
        .promise();
      return;
    } catch (error) {
      this.logger.error('S3_MODULE<REMOVE_IMAGE>', {
        meta: {
          error
        }
      });
    }
  }
}
