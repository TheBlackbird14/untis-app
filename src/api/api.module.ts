import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { FetchModule } from 'src/fetch/fetch.module';
import { DatabaseModule } from 'src/database/database.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { UserAnalytics } from "../middleware/user-analytics.entity";

@Module({
  controllers: [ApiController],
  providers: [ApiService],
  imports: [FetchModule, DatabaseModule, EncryptionModule],
  exports: [ApiService],
})
export class ApiModule {}
