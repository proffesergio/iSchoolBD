import './env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // '*' with credentials:true is rejected by browsers — reflect the origin instead.
  const origins = process.env.WEB_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  const corsOrigin = origins.length === 0 || origins.includes('*') ? true : origins;
  app.enableCors({ origin: corsOrigin, credentials: true });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[api] listening on :${port}/api`);
}
bootstrap();
