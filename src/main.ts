import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {

  // Set up CORS options
  const corsOptions: CorsOptions = {
    origin: '*', // Allow requests from any origin. You can specify specific origins if needed.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify the allowed HTTP methods.
    credentials: true, // Allow cookies and other credentials to be sent.
    optionsSuccessStatus: 204, // Set the preflight response status (204 means "No Content").
  };

  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    //ca: fs.readFileSync(process.env.SSL_CA_PATH)
  }
  
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.enableCors(corsOptions);

  await app.listen(3000);
}
bootstrap();
