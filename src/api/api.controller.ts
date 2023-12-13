import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { MarkCompleted } from './completion.dto';
import { HomeworkDto } from './homework.dto';
import { createHomeworkDto } from './create-homework.dto';

@Controller('api')
export class ApiController {
  constructor(private apiService: ApiService) {}

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
  async markCompleted(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ValidationPipe({ transform: true })) markCompleted: MarkCompleted,
    @Req() request: Request,
  ) {
    // Accessing headers for authentication information
    const authHeader = request.headers['authorization'];

    await this.apiService.updateEntry(authHeader, id, markCompleted);
  }

  @Post('homework/create')
  async createHomework(
    @Body(new ValidationPipe({ transform: true }))
    homework: createHomeworkDto,
    @Req() request: Request,
  ) {
    // Accessing headers for authentication information
    const authHeader = request.headers['authorization'];

    await this.apiService.createHomework(homework, authHeader);
  }

  @Get('homework/delete/:id')
  async deleteEntry(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() request: Request,
  ) {
    const authHeader = request.headers['authorization'];

    await this.apiService.deleteEntry(id, authHeader);
  }
}

@Controller('api/food')
export class FoodApiController {
  constructor(private apiService: ApiService) {}

  @Get('load')
  async loadFoodSchedule() {
    await this.apiService.loadFoodSchedule();
  }

  @Get('latest')
  async getLatestFoodSchedule() {
    return await this.apiService.getFoodSchedule();
  }
}
