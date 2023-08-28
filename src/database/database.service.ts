import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homework } from './homework.entity';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

@Injectable()
export class DatabaseService {
    
    constructor(
        @InjectRepository(Homework)
        private homeworkRepository: Repository<Homework>
    ) { }

    createEntry(homework: Homework) {
        this.homeworkRepository.insert(homework)
    }

    async getByID(id: number): Promise<Homework | null> {
        return await this.homeworkRepository.findOne({ where: { id: id } });
    }

    async getAll(): Promise<Homework[]> {
        return await this.homeworkRepository.find();
    }

    async update(id: number, data: any) {

        if (Object.keys(data).length === 0) {
            console.log('empty data');

            console.log(data);
            console.log(id);

            throw new HttpErrorByCode[400]

            return
        }

        
        
        await this.homeworkRepository.update(id, data)
    }

}
