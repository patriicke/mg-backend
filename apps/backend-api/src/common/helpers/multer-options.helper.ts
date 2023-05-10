import { HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { CustomHttpException, StatusCodesList } from '@app/common-module';

export const multerOptionsHelper = (maxFileSize: number): MulterOptions => ({
  limits: {
    fileSize: +maxFileSize
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|heif)$/)) {
      cb(null, true);
    } else {
      cb(
        new CustomHttpException(
          'unsupportedFileType',
          HttpStatus.BAD_REQUEST,
          StatusCodesList.UnsupportedFileType
        ),
        false
      );
    }
  }
});
