import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiService } from './api.service';
import { Homework } from 'src/database/homework.entity';
import { MarkCompleted } from './completion.dto';

@Controller('api')
export class ApiController {

    constructor(
        private apiService: ApiService
    ) { }

    @Get('homework/load')
    async loadHomework() {
        const now = new Date()
        console.log(`--${now.toISOString()}--> Loading Data in to DB`);
        
        await this.apiService.loadHomework();
    }

    @Get('homework/all')
    async getAllHomework(): Promise<Homework[]> {
        const now = new Date()
        console.log(`--${now.toISOString()}--> Data requested`);
        return await this.apiService.getAllHomework();
    }

    @Put('homework/:id')
    async markCompleted(@Param('id') id: number, @Body() markCompleted: MarkCompleted) {
        const now = new Date()
        console.log(`--${now.toISOString()}--> Updating entry with ID ${id}`);
        
        await this.apiService.updateEntry(id, markCompleted)
    }

}
