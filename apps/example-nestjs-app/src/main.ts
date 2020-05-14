/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { config } from './config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const welcome = configService.get<boolean>('WELCOME_MESSAGE');
  Logger.log(`Value of welcome from ConfigService is ${welcome}`);

  const globalPrefix = config.get('globalPrefix');
  app.setGlobalPrefix(globalPrefix);

  const port = config.get('appPort');

  await app.listen(port, () => {
    if (welcome) {
      // if (config.get('showWelcomeMessage')) {
      Logger.log(
        `Welcome to Nest! Listening at http://localhost:${port}/${globalPrefix}`
      );
    }
  });
}

bootstrap();
