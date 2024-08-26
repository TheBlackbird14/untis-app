import { forwardRef, Module } from '@nestjs/common';
import { ApiController, FoodApiController } from './api.controller';
import { ApiService } from './api.service';
import { FetchModule } from 'src/fetch/fetch.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from '../authentication/auth.module';

@Module({
  controllers: [ApiController, FoodApiController],
  providers: [ApiService],
  imports: [FetchModule, DatabaseModule, forwardRef(() => AuthModule)],
  exports: [ApiService],
})
export class ApiModule {}
