import winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';

export default {
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  exitOnError: false
} as WinstonModuleOptions;
