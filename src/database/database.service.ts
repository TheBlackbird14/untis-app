import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homework } from './homework.entity';

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
        console.log(data);
        console.log(id);
        
        
        await this.homeworkRepository.update(id, data)
    }

}
