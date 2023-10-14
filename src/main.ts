import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up CORS options
  const corsOptions: CorsOptions = {
    origin: '*', // Allow requests from any origin. You can specify specific origins if needed.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify the allowed HTTP methods.
    credentials: true, // Allow cookies and other credentials to be sent.
    optionsSuccessStatus: 204, // Set the preflight response status (204 means "No Content").
  };

  app.enableCors(corsOptions);

  await app.listen(3000);
}
bootstrap();
