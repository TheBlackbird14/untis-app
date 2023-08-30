import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Base, WebUntis } from 'webuntis';
import { DatabaseService } from 'src/database/database.service';
import { Homework, Homework as homework } from 'src/database/homework.entity';
import { HomeworkData } from './untis-api.interface';



@Injectable()
export class FetchService {
    
    constructor(
        private dbService: DatabaseService
    ) { }

    untis: WebUntis;


    async importHomework(username: string, password: string) {

        const now = new Date()
        console.log(`--${now.toISOString()}--> Loading Data in to DB`);

        this.untis = new WebUntis('aloisiuskolleg', username, password, 'peleus.webuntis.com');

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

        var mappingArray: IdMapping[] = [];


        parsedData.records.forEach(element => {
            var record: IdMapping = {};

            record.homeworkId = element.homeworkId;
            record.teacherId = element.teacherId;

            mappingArray.push(record);
        });


        parsedData.homeworks.forEach(async element => {

            const check = await this.dbService.getHomeworkByID(element.id)
            if (check !== null) { // homework exists in db

                const homeworkEntry = new Homework()
                homeworkEntry.id = element.id

                this.dbService.createHomeworkEntry(username, homeworkEntry);
                
                return;
            }

            let homeworkEntry: homework = new Homework();

            homeworkEntry.id = element.id;
            homeworkEntry.text = element.text;
            homeworkEntry.remark = element.remark;
            homeworkEntry.students = [];

            homeworkEntry.dateAdded = Base.convertUntisDate(element.date.toString());
            homeworkEntry.dateDue = Base.convertUntisDate(element.dueDate.toString());



            const index = mappingArray.findIndex( item => item.homeworkId === homeworkEntry.id);
            mappingArray[index].lessonId = element.lessonId;

            parsedData.teachers.forEach(element => {
                if (mappingArray[index].teacherId === element.id) {
                    homeworkEntry.teacher = element.name;
                }
            });

            parsedData.lessons.forEach(element => {
                if (mappingArray[index].lessonId === element.id) {
                    homeworkEntry.subject = element.subject;
                }
            });

            //console.log(homeworkEntry);
            
            this.dbService.createHomeworkEntry(username, homeworkEntry);

            this.untis.logout();

            
        });

    }

}
