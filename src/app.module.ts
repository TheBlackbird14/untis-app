import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FetchModule } from './fetch/fetch.module';
import { ApiModule } from './api/api.module';
import { DatabaseModule } from './database/database.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CronService } from './cron/cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { EncryptionService } from './encryption/encryption.service';
import { EncryptionModule } from './encryption/encryption.module';
import { ConfigModule } from '@nestjs/config';

import { ActivityMiddleware } from './middleware/activity.middleware';
import { ApiService } from './api/api.service';
import { UserAnalytics } from './middleware/user-analytics.entity';
import {MiddlewareModule} from "./middleware/middleware.module";

@Module({
  controllers: [AppController],
  imports: [
    FetchModule,
    ApiModule,
    DatabaseModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([UserAnalytics]),
    ScheduleModule.forRoot(),
    EncryptionModule,
    ConfigModule,
    ConfigModule.forRoot(),
    MiddlewareModule,
  ],
  providers: [AppService, CronService, EncryptionService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActivityMiddleware)
      .forRoutes(
        { path: 'api/homework/all', method: RequestMethod.GET },
        { path: '/api/homework/:id', method: RequestMethod.PUT },
        { path: '/api/homework/create', method: RequestMethod.POST },
        { path: 'api/homework/delete/:id', method: RequestMethod.GET },
      );
  }
}
