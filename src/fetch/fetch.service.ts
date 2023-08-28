import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Base, WebUntis } from 'webuntis';
import { DatabaseService } from 'src/database/database.service';
import { Homework, Homework as homework } from 'src/database/homework.entity';
import { HomeworkData } from './untis-api.interface';



@Injectable()
export class FetchService implements OnModuleInit, OnModuleDestroy {
    
    constructor(
        private dbService: DatabaseService
    ) { }

    untis: WebUntis;

    async onModuleInit() {
        this.untis = new WebUntis('aloisiuskolleg', 'JesselMika', 'Bonn#2023', 'peleus.webuntis.com');

        await this.untis.login();
    }
     async onModuleDestroy() {
         await this.untis.logout();
     }

    async importHomework() {
        const now = new Date();
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

            const check = await this.dbService.getByID(element.id)
            if (check !== null) {
                //console.log('skipped');
                
                return;
            }

            let homeworkEntry: homework = new Homework();

            homeworkEntry.id = element.id;
            homeworkEntry.text = element.text;
            homeworkEntry.completed = element.completed;
            homeworkEntry.remark = element.remark;

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

            this.dbService.createEntry(homeworkEntry);

        });

    }

}
