import { Module } from '@nestjs/common';
import { FetchService } from './fetch.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [FetchService],
  exports: [FetchService],
})
export class FetchModule {}
