import { HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

import { CustomHttpException } from '../exception/custom-http.exception';
import { StatusCodesList } from '../custom-constant/status-codes-list.constant';

export const multerOptionsHelper = (
  destinationPath: string,
  maxFileSize: number
) => ({
  limits: {
    fileSize: +maxFileSize
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const regex = /\/(jpg|jpeg|png|gif)$/;
    if (!file.mimetype.match(regex)) {
      return cb(
        new CustomHttpException(
          'unsupportedFileType',
          HttpStatus.BAD_REQUEST,
          StatusCodesList.UnsupportedFileType
        ),
        false
      );
    }
    cb(null, true);
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      // Create folder if doesn't exist
      if (!existsSync(destinationPath)) {
        mkdirSync(destinationPath, { recursive: true });
      }
      cb(null, destinationPath);
    },
    filename: (req: any, file: any, cb: any) => {
      cb(null, `${uuid()}${extname(file.originalname)}`);
    }
  })
});
