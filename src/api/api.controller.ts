import { Body, Controller, Get, Param, ParseIntPipe, Put, Req, ValidationPipe } from '@nestjs/common';
import { ApiService } from './api.service';
import { Homework } from 'src/database/homework.entity';
import { MarkCompleted } from './completion.dto';
import { HomeworkDto } from './homework.dto';

@Controller('api')
export class ApiController {

    constructor(
        private apiService: ApiService
    ) { }

    @Get('homework/load')
    async loadHomework(@Req() request: Request) {

        // Accessing headers for authentication information
        const authHeader = request.headers['authorization'];

        await this.apiService.loadHomework(authHeader);
    }

    @Get('homework/all')
    async getAllHomework(@Req() request: Request): Promise<HomeworkDto[]> {

        // Accessing headers for authentication information
        const authHeader = request.headers['authorization'];

        return await this.apiService.getAllHomework(authHeader);
    }

    @Put('homework/:id')
    async markCompleted(@Param('id', new ParseIntPipe()) id: number, @Body(new ValidationPipe({ transform: true })) markCompleted: MarkCompleted, @Req() request: Request) {

        // Accessing headers for authentication information
        const authHeader = request.headers['authorization'];
        
        await this.apiService.updateEntry(authHeader, id, markCompleted)
    }

}
