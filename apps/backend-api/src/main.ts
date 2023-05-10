import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import config from 'config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule
} from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { json } from 'express';
import requestIp from 'request-ip';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const serverConfig = config.get('server');
  const port = process.env.PORT || serverConfig.port;
  const app = await NestFactory.create(AppModule);
  const apiConfig = config.get('app');
  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true
    });
    const swaggerConfig = new DocumentBuilder()
      .setTitle(apiConfig.name)
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
  }
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );
  app.use(requestIp.mw());
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(helmet());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(port);
  logger.log(`Application listening in port: ${port}`);
}

bootstrap();
