import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Homework } from './homework.entity';
import { UntisUser } from './user.entity';
import { HomeworkState } from './homework-state.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([Homework, UntisUser, HomeworkState]) ],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}
