import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Homework } from './homework.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([Homework]) ],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}
