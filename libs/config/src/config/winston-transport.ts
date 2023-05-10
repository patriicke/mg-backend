import winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';

export const winstonTransports = (logPath = 'logs') => ({
  console: new winston.transports.Console({
    level: 'silly',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.colorize({
        colors: {
          info: 'blue',
          debug: 'yellow',
          error: 'red'
        }
      }),
      winston.format.printf((info) => {
        return `${info.timestamp} [${info.level}] [${
          info.context ? info.context : info.stack
        }] ${info.message}`;
      }),
      winston.format.align()
    )
  }),
  combinedFile: new winstonDailyRotateFile({
    dirname: logPath,
    filename: 'combined',
    extension: '.log',
    level: 'info'
  }),
  errorFile: new winstonDailyRotateFile({
    dirname: logPath,
    filename: 'error',
    extension: '.log',
    level: 'error'
  })
});
