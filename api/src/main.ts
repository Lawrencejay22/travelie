import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const publicDir = join(process.cwd(), 'public');
  mkdirSync(join(publicDir, 'uploads'), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.useStaticAssets(publicDir, { prefix: '/static/' });
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = config.getOrThrow<string[]>('corsOrigins');
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Travelie API')
    .setDescription('Discover. Navigate. Experience.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(config.get<number>('port') ?? 4000);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});