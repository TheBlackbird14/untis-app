import { Injectable } from '@nestjs/common';
import { Base, WebUntis } from 'webuntis';
import { DatabaseService } from 'src/database/database.service';
import { Homework, Homework as homework } from 'src/database/homework.entity';
import { HomeworkData } from './untis-api.interface';
import { getFoodItems } from 'inetmenue';
import { FoodData } from './inetmenue-api.interface';
import { FoodSchedule } from '../database/food-schedule.entity';

@Injectable()
export class FetchService {
  constructor(private dbService: DatabaseService) {}

  untis: WebUntis;

  async importHomework(username: string, password: string) {
    const now = new Date();
    console.log(`--${now.toISOString()}--> Loading Data in to DB`);

    this.untis = new WebUntis(
      'aloisiuskolleg',
      username,
      password,
      'peleus.webuntis.com',
    );

    await this.untis.login();

    const then = new Date();
    then.setFullYear(now.getFullYear() + 1);

    const response = await this.untis.getHomeWorksFor(now, then);

    const parsedData: HomeworkData = JSON.parse(JSON.stringify(response));

    interface IdMapping {
      homeworkId?: number;
      teacherId?: number;
      lessonId?: number;
    }

    const mappingArray: IdMapping[] = [];

    parsedData.records.forEach((element) => {
      const record: IdMapping = {};

      record.homeworkId = element.homeworkId;
      record.teacherId = element.teacherId;

      mappingArray.push(record);
    });

    for (const element of parsedData.homeworks) {
      const check = await this.dbService.getHomeworkByID(element.id);
      if (check !== null) {
        // homework exists in db

        const homeworkEntry = new Homework();
        homeworkEntry.id = element.id;
        homeworkEntry.text = element.text;

        await this.dbService.createHomeworkEntry(username, homeworkEntry);

        continue;
      }

      const homeworkEntry: homework = new Homework();

      homeworkEntry.id = element.id;
      homeworkEntry.text = element.text;
      homeworkEntry.remark = element.remark;
      homeworkEntry.students = [];

      homeworkEntry.dateAdded = Base.convertUntisDate(element.date.toString());
      homeworkEntry.dateDue = Base.convertUntisDate(element.dueDate.toString());

      const index = mappingArray.findIndex(
        (item) => item.homeworkId === homeworkEntry.id,
      );
      mappingArray[index].lessonId = element.lessonId;

      parsedData.teachers.forEach((element) => {
        if (mappingArray[index].teacherId === element.id) {
          homeworkEntry.teacher = element.name;
        }
      });

      parsedData.lessons.forEach((element) => {
        if (mappingArray[index].lessonId === element.id) {
          homeworkEntry.subject = element.subject;
        }
      });

      //console.log(homeworkEntry);

      await this.dbService.createHomeworkEntry(username, homeworkEntry);

      await this.untis.logout();
    }
  }

  async importFood(calendarWeek: string) {
    const foodItems = await getFoodItems({ kw: calendarWeek, source: 'ako' });

    const parsedData: FoodData[] = JSON.parse(JSON.stringify(foodItems));
    const foodSchedule: FoodSchedule[] = [];

    parsedData.forEach((element) => {
      console.log(element);

      if (
        element.title === 'Menü mit Spätbucheraufschlag' ||
        element.dayLong === undefined
      )
        return;

      const entry = new FoodSchedule();

      entry.text = element.title;

      if (element.title === '') {
        entry.text = 'Kein Essen';
      }

      const dateString = element.dayLong.split(',')[1];

      //covert date string "dd.mm.yyyy" to Date object
      const date = new Date();
      date.setDate(parseInt(dateString.split('.')[0]));
      date.setMonth(parseInt(dateString.split('.')[1]) - 1);
      date.setFullYear(parseInt(dateString.split('.')[2]));

      //set time to 13:15
      date.setHours(13);
      date.setMinutes(15);
      date.setSeconds(0);
      date.setMilliseconds(0);

      entry.date = date;

      entry.probability = [];

      // console.log(entry);

      foodSchedule.push(entry);
    });

    // if no food is available, add 5 entries with the text "Kein Essen"

    if (foodSchedule.length === 0) {
      for (let i = 0; i < 5; i++) {
        const entry = new FoodSchedule();
        entry.text = 'Kein Essen';
        entry.date = new Date();
        entry.date.setDate(entry.date.getDate() + i);
        entry.date.setHours(13);
        entry.date.setMinutes(15);
        entry.date.setSeconds(0);
        entry.date.setMilliseconds(0);
        foodSchedule.push(entry);
      }
    }

    if ((await this.dbService.getFoodSchedule()).length > 0) {
      const now = new Date();
      console.log(
        `--${now.toISOString()}--> Saving Food Schedule for week ${calendarWeek}`,
      );

      await this.dbService.renewFoodSchedule(foodSchedule);
    } else {
      const now = new Date();
      console.log(`--${now.toISOString()}--> Storing Food Schedule`);
      await this.dbService.storeFoodSchedule(foodSchedule);
    }
  }
}
