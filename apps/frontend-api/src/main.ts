import { NestFactory } from '@nestjs/core';
import {
  Logger,
  UnprocessableEntityException,
  ValidationPipe
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import config from 'config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule
} from '@nestjs/swagger';
import helmet from 'helmet';
import {
  InternalErrorExceptionsFilter,
  NotFoundExceptionFilter,
  ResponseTransformInterceptor,
  ValidationExceptionFilter,
  CustomHttpExceptionFilter,
  UnauthorizedExceptionFilter,
  ForbiddenExceptionFilter
} from '@app/common-module';
import requestIp from 'request-ip';
import { json } from 'express';

import { FrontendApiModule } from './frontend-api.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const serverConfig = config.get('server');
  const port = process.env.PORT || serverConfig.port;
  const app = await NestFactory.create(FrontendApiModule);
  const apiConfig = config.get('app');
  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true
    });
    const swaggerConfig = new DocumentBuilder()
      .setTitle(apiConfig.frontendName)
      .setDescription(apiConfig.description)
      .setVersion(apiConfig.version)
      .addBearerAuth()
      .build();
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true
      },
      customSiteTitle: apiConfig.description
    };
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document, customOptions);
  } else {
    const whitelist = [
      apiConfig.get<string>('frontendUrl'),
      'http://3.106.128.104:5000',
      'http://localhost:3000',
      'http://localhost:7777'
    ];
    app.enableCors({
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    });
    logger.log(
      `Accepting request only from: ${
        process.env.ORIGIN || serverConfig.origin
      }`
    );
  }
  useContainer(app.select(FrontendApiModule), {
    fallbackOnErrors: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors)
    })
  );
  app.use(requestIp.mw());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.useGlobalFilters(new ForbiddenExceptionFilter());
  app.useGlobalFilters(new CustomHttpExceptionFilter());
  app.useGlobalFilters(new InternalErrorExceptionsFilter());
  app.use(json({ limit: '10mb' }));

  app.use(cookieParser());
  app.use(helmet());
  await app.listen(port);
  logger.log(`Application listening in port: ${port}`);
}

bootstrap();
