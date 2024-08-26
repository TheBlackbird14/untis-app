import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { FetchService } from 'src/fetch/fetch.service';
import { Homework } from 'src/database/homework.entity';
import { WebUntis } from 'webuntis';
import { HomeworkDto } from './homework.dto';
import { createHomeworkDto } from './create-homework.dto';

@Injectable()
export class ApiService {
  constructor(
    private fetchService: FetchService,
    private dbService: DatabaseService,
  ) {}

  async loadHomework(credentials: { username: string; password: string }) {
    const username = credentials.username;
    const password = credentials.password;

    if (await this.checkUserInUntis(username, password)) {
      //if auth works in untis

      //console.log('passed auth');

      if (!(await this.checkUserInDB(username))) {
        //if user is not yet registered

        //console.log('user not yet registered');

        const now = new Date();
        console.log(`--${now.toISOString()}--> Creating new user ${username}`);

        await this.dbService.createUser(username);
      } else {
        //console.log('user already registered');
      }
    } else {
      throw new HttpException('bad auth', HttpStatus.FORBIDDEN);
    }

    await this.fetchService.importHomework(username, password);
  }
  async getAllHomework(credentials: {
    username: string;
    password: string;
  }): Promise<HomeworkDto[]> {
    const username = credentials.username;
    const password = credentials.password;

    if (await this.checkUserInUntis(username, password)) {
      //if auth works in untis

      //console.log('passed auth');

      if (!(await this.checkUserInDB(username))) {
        //if user is not yet registered

        //console.log('user not yet registered');

        const now = new Date();
        console.log(`--${now.toISOString()}--> Creating new user ${username}`);

        await this.dbService.createUser(username);
      } else {
        //console.log('user already registered');
      }

      const user = await this.dbService.getUserByUsername(username);

      await this.fetchService.importHomework(username, password);
      const homework = await this.dbService.getAllHomework(user);

      const homeworkDto = homework.map(async (homeworkItem) => {
        const homeworkDtoItem = new HomeworkDto();
        homeworkDtoItem.id = homeworkItem.id;
        homeworkDtoItem.dateAdded = homeworkItem.dateAdded;
        homeworkDtoItem.dateDue = homeworkItem.dateDue;
        homeworkDtoItem.text = homeworkItem.text;
        homeworkDtoItem.remark = homeworkItem.remark;
        homeworkDtoItem.teacher = homeworkItem.teacher;
        homeworkDtoItem.subject = homeworkItem.subject;
        homeworkDtoItem.completed = await this.dbService.getCompleted(
          user,
          homeworkItem.id,
        );
        return homeworkDtoItem;
      });

      return Promise.all(homeworkDto);
    } else {
      throw new HttpException('bad auth', HttpStatus.FORBIDDEN);
    }
  }

  async updateEntry(
    credentials: { username: string; password: string },
    id: number,
    data: any,
  ) {
    const lowerLimit = -2147483648; // Minimum value of PostgreSQL integer
    const upperLimit = 2147483647; // Maximum value of PostgreSQL integer

    if (id >= upperLimit || id <= lowerLimit) {
      throw new HttpException('Integer value not valid', 400);
    }

    if ((await this.dbService.getHomeworkByID(id)) === null) {
      throw new HttpException('Homework with that ID does not exist', 404);
    }

    const username = credentials.username;
    const password = credentials.password;

    if (await this.checkUserInUntis(username, password)) {
      //if auth works in untis
      const untisUser = await this.dbService.getUserByUsername(username);

      await this.dbService.update(untisUser, id, data);
    } else {
      throw new HttpException('bad auth', HttpStatus.FORBIDDEN);
    }
  }

  async checkUserInDB(username: string): Promise<boolean> {
    return (await this.dbService.getUserByUsername(username)) !== null;
  }

  async checkUserInUntis(username: string, password: string): Promise<boolean> {
    const now = new Date();

    const untis = new WebUntis(
      'aloisiuskolleg',
      username,
      password,
      'peleus.webuntis.com',
    );

    try {
      await untis.login();
    } catch (error) {
      console.log(
        `--${now.toISOString()}--> Auth Failed for user: ${username}`,
      );
      return false;
    }

    return true;
  }

  async createHomework(
    credentials: { username: string; password: string },
    homeworkDto: createHomeworkDto,
  ) {
    const username = credentials.username;
    const password = credentials.password;

    if (await this.checkUserInUntis(username, password)) {
      if (await this.checkUserInDB(username)) {
        //if user is not yet registered

        const now = new Date();
        console.log(
          `--${now.toISOString()}--> Creating Homework Entry for user ${username}`,
        );

        const homework = new Homework();
        homework.id = await this.dbService.createHomeworkId();
        homework.dateAdded = new Date();
        homework.dateDue = homeworkDto.dateDue;
        homework.text = homeworkDto.text;
        homework.remark = '';
        homework.teacher = homeworkDto.teacher;
        homework.subject = homeworkDto.subject;
        homework.students = [
          (await this.dbService.getUserByUsername(username)).id,
        ];

        await this.dbService.createHomeworkEntry(username, homework);
      } else {
        throw new HttpException('user not in db', HttpStatus.FORBIDDEN);
      }
    } else {
      throw new HttpException('bad auth', HttpStatus.FORBIDDEN);
    }
  }

  async deleteEntry(
    credentials: { username: string; password: string },
    id: number,
  ) {
    const lowerLimit = -2147483648; // Minimum value of PostgreSQL integer
    if (id >= 0 || id <= lowerLimit) {
      throw new HttpException('ID value not valid', 400);
    }

    if ((await this.dbService.getHomeworkByID(id)) === null) {
      throw new HttpException('Homework with that ID does not exist', 404);
    }

    const username = credentials.username;
    const password = credentials.password;

    if (await this.checkUserInUntis(username, password)) {
      const now = new Date();
      console.log(
        `--${now.toISOString()}--> Deleting item with ID ${id} for user ${username}`,
      );
      await this.dbService.deleteEntry(id);
    } else {
      throw new HttpException('bad auth', HttpStatus.FORBIDDEN);
    }
  }

  async loadFoodSchedule(week: string) {
    const weekString = week.padStart(2, '0');

    await this.fetchService.importFood(weekString);
  }

  async getFoodSchedule() {
    return await this.dbService.getFoodSchedule();
  }
}
