import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnalytics } from './user-analytics.entity';
import { ActivityMiddleware } from './activity.middleware';
import { ApiModule } from '../api/api.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAnalytics]),
    ApiModule,
    DatabaseModule,
  ],
  providers: [ActivityMiddleware],
})
export class MiddlewareModule {}
