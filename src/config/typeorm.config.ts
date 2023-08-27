import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Homework } from "src/database/homework.entity";

export const typeOrmConfig: TypeOrmModuleOptions = 
{

    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'untis',
    password: '',
    database: 'untis',
    entities: [Homework],
    synchronize: true
  
}