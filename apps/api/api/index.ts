import '../src/env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

// Vercel Node functions call the default export as (req, res). An Express
// app IS a (req, res) listener, so we boot Nest once per lambda instance
// and forward requests to the underlying Express instance. No app.listen()
// — Vercel owns the HTTP server.
let cachedApp: any;

async function getExpressApp() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, { cors: false });
    app.use(helmet());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    // '*' with credentials:true is rejected by browsers — reflect the origin instead.
    const origins = process.env.WEB_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
    const corsOrigin = origins.length === 0 || origins.includes('*') ? true : origins;
    app.enableCors({ origin: corsOrigin, credentials: true });
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const expressApp = await getExpressApp();
  return expressApp(req, res);
}
