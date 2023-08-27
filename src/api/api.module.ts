import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { FetchModule } from 'src/fetch/fetch.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ApiController],
  providers: [ApiService],
  imports: [FetchModule, DatabaseModule]
})
export class ApiModule {}
