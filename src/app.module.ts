import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FetchModule } from './fetch/fetch.module';
import { ApiModule } from './api/api.module';
import { DatabaseModule } from './database/database.module';

import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    FetchModule, 
    ApiModule, 
    DatabaseModule,
    TypeOrmModule.forRoot(typeOrmConfig)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
