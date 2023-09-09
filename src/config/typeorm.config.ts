import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HomeworkState } from 'src/database/homework-state.entity';
import { Homework } from 'src/database/homework.entity';
import { UntisUser } from 'src/database/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'untis',
  password: '',
  database: 'untis',
  entities: [Homework, UntisUser, HomeworkState],
  synchronize: true,
};
