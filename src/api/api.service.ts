import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { FetchService } from 'src/fetch/fetch.service';
import { Homework } from 'src/database/homework.entity';
import { Base, WebUntis } from 'webuntis';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { UntisUser } from 'src/database/user.entity';
import { HomeworkDto } from './homework.dto';

@Injectable()
export class ApiService {
    constructor(
        private fetchService: FetchService,
        private dbService: DatabaseService
    ) { }

    async loadHomework(authHeader: any) {

        const [username, password] = this.decodeAuthHeader(authHeader);

        if (await this.checkUserInUntis(username, password)) {
            //if auth works in untis

            //console.log('passed auth');


            if (!(await this.checkUserInDB(username))) { //if user is not yet registered

                //console.log('user not yet registered');
                

                this.dbService.createUser(username);
                
            } else {
                //console.log('user already registered');
            }

        } else {
            throw new HttpException('bad auth', HttpStatus.FORBIDDEN);
        }

        await this.fetchService.importHomework(username, password);
    }

    decodeAuthHeader(authHeader: any): [string, string] {
        if (authHeader) {
            // Parse or manipulate the authentication header
            const [, authValue] = authHeader.split(' ');
            const decodedAuth = Buffer.from(authValue, 'base64').toString('utf-8');
            const [username, password] = decodedAuth.split(':');
            return [username, password];
        } else {
            throw new HttpException('No auth supplied.', HttpStatus.FORBIDDEN);
        }
    }

    async getAllHomework(authHeader: any): Promise<HomeworkDto[]> {
        
        const [username, password] = this.decodeAuthHeader(authHeader);


        if (await this.checkUserInUntis(username, password)) {
            //if auth works in untis

            //console.log('passed auth');


            if (!(await this.checkUserInDB(username))) { //if user is not yet registered

                //console.log('user not yet registered');
                

                this.dbService.createUser(username);
                
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
                homeworkDtoItem.completed = await this.dbService.getCompleted(user, homeworkItem.id);
                return homeworkDtoItem;
            });

            return Promise.all(homeworkDto);
        } else {
            throw new HttpException('bad auth', HttpStatus.FORBIDDEN);
        }
      
    }


    async updateEntry(authHeader: any, id: number, data: any) {

        const lowerLimit = -2147483648; // Minimum value of PostgreSQL integer
        const upperLimit = 2147483647;  // Maximum value of PostgreSQL integer

        if (id >= upperLimit || id <= lowerLimit) {
            throw new HttpException("Integer value not valid", 400);
        }

        if (await this.dbService.getHomeworkByID(id) === null) {
            throw new HttpException("Homework with that ID does not exist", 404);
        }
        

        const [username, password] = this.decodeAuthHeader(authHeader);
        if (await this.checkUserInUntis(username, password)) {
            //if auth works in untis
            const user = await this.dbService.getUserByUsername(username)
        
            await this.dbService.update(user, id, data);
        } else {
            throw new HttpException('bad auth', HttpStatus.FORBIDDEN);
        }

        
    }

    async checkUserInDB(username: string): Promise<boolean> {
        return await this.dbService.getUserByUsername(username) !== null;
    }

    async checkUserInUntis(username: string, password: string): Promise<boolean> {
        const now = new Date()
        
        const untis = new WebUntis('aloisiuskolleg', username, password, 'peleus.webuntis.com');
        
        
        try {
            await untis.login();    
        } catch (error) {
            console.log(`--${now.toISOString()}--> Auth Failed`);
            return false;
        }

        return true;

    }
}
