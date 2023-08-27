import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { FetchService } from 'src/fetch/fetch.service';
import { Homework } from 'src/database/homework.entity';

@Injectable()
export class ApiService {
    constructor(
        private fetchService: FetchService,
        private dbService: DatabaseService
    ) { }

    async loadHomework() {
        await this.fetchService.importHomework()
    }

    async getAllHomework(): Promise<Homework[]> {
        return await this.dbService.getAll();
    }

    async updateEntry(id: number, data: any) {
        await this.dbService.update(id, data)
    }
}
