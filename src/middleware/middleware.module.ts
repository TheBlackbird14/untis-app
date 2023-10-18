import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnalytics } from './user-analytics.entity';
import { ActivityMiddleware } from './activity.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([UserAnalytics])],
  providers: [ActivityMiddleware],
})
export class MiddlewareModule {}
