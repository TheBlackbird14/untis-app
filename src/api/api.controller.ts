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
        await this.apiService.loadHomework();
    }

    @Get('homework/all')
    async getAllHomework(): Promise<Homework[]> {
        return await this.apiService.getAllHomework();
    }

    @Put('homework/:id')
    async markCompleted(@Param('id') id: number, @Body() markCompleted: MarkCompleted) {
        //console.log(markCompleted);
        
        await this.apiService.updateEntry(id, markCompleted)
    }

}
