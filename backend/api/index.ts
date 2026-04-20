import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

const expressApp = express();
let isReady = false;
let bootError: Error | null = null;
let openApiDocument: Record<string, unknown> | null = null;

// Serve Swagger UI via CDN (registered before NestJS to take priority)
expressApp.get('/api/docs', (_req: Request, res: Response) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Real Estate CRM API</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>body { margin: 0; } .topbar { display: none; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs-json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'StandaloneLayout'
    });
  </script>
</body>
</html>`);
});

expressApp.get('/api/docs-json', (_req: Request, res: Response) => {
  if (!openApiDocument) return res.status(503).json({ error: 'Not ready' });
  res.json(openApiDocument);
});

async function bootstrap() {
  try {
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn', 'log'],
    });

    app.setGlobalPrefix('api');
    app.enableCors({
      origin: true,
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

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Real Estate CRM API')
      .setDescription('Transaction management and commission distribution API')
      .setVersion('1.0')
      .build();
    openApiDocument = SwaggerModule.createDocument(app, swaggerConfig) as unknown as Record<string, unknown>;

    await app.init();
    isReady = true;
  } catch (error) {
    bootError = error as Error;
    console.error('Bootstrap failed:', error);
  }
}

const bootstrapPromise = bootstrap();

export default async function handler(req: Request, res: Response) {
  await bootstrapPromise;

  if (bootError) {
    res.status(500).json({
      error: 'Bootstrap failed',
      message: bootError.message,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20),
    });
    return;
  }

  expressApp(req, res);
}
