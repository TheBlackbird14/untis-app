import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
async function bootstrap() {
  // Set up CORS options
  const corsOptions: CorsOptions = {
    // origin: 'http://localhost:5173',
    origin: 'https://hausaufgaben.live', // Allow requests from any origin. You can specify specific origins if needed.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify the allowed HTTP methods.
    credentials: true, // Allow cookies and other credentials to be sent.
    optionsSuccessStatus: 204, // Set the preflight response status (204 means "No Content").
  };

  const app = await NestFactory.create(AppModule);

  app.enableCors(corsOptions);
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
