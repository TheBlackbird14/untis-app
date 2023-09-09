import { Module } from '@nestjs/common';
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

@Module({
  controllers: [AppController],
  imports: [
    FetchModule,
    ApiModule,
    DatabaseModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    ScheduleModule.forRoot(),
    EncryptionModule,
    ConfigModule,
    ConfigModule.forRoot(),
  ],
  providers: [AppService, CronService, EncryptionService],
})
export class AppModule {}
