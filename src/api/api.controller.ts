import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiService } from './api.service';
import { MarkCompleted } from './completion.dto';
import { HomeworkDto } from './homework.dto';
import { createHomeworkDto } from './create-homework.dto';
import { AuthService } from '../authentication/auth.service';
import { AuthGuard } from '../authentication/auth.guard';

@Controller('api')
export class ApiController {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body()
    credentials: { username: string; password: string; stayLoggedIn: boolean },
    @Res() res: Response,
  ) {
    // Check if the username and password are correct
    const cookies = await this.authService.login(credentials);

    // Set the cookie with the appropriate options
    res.cookie('authToken', cookies.encrypted, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      domain: '.hausaufgaben.live',
      path: '/',
      //max age dependent on the stayLoggedIn option
      maxAge: credentials.stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    res.cookie('IV', cookies.IV, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      domain: '.hausaufgaben.live',
      path: '/',
      //max age dependent on the stayLoggedIn option
      maxAge: credentials.stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    res.cookie('username', credentials.username, {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      domain: '.hausaufgaben.live',
      path: '/',
      //max age dependent on the stayLoggedIn option
      maxAge: credentials.stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    res.cookie('stayLoggedIn', credentials.stayLoggedIn, {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      domain: '.hausaufgaben.live',
      path: '/',
      //max age dependent on the stayLoggedIn option
      maxAge: credentials.stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    return res.send('Login Successful');
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const stayLoggedIn = req.cookies['stayLoggedIn'];

    res.clearCookie('authToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      domain: '.hausaufgaben.live',
      path: '/',
      //max age dependent on the stayLoggedIn option
      maxAge: stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    res.clearCookie('IV', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      domain: '.hausaufgaben.live',
      path: '/',
      //max age dependent on the stayLoggedIn option
      maxAge: stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    res.clearCookie('username', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      domain: '.hausaufgaben.live',
      path: '/',
      //max age dependent on the stayLoggedIn option
      maxAge: stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    res.clearCookie('stayLoggedIn', {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      domain: '.hausaufgaben.live',
      path: '/',
      //max age dependent on the stayLoggedIn option
      maxAge: stayLoggedIn ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    return res.send('Logout Successful');
  }

  @Get('homework/load')
  @UseGuards(AuthGuard)
  async loadHomework(@Req() request: Request) {
    const username = request.cookies['username'];
    const password = request.cookies['password'];

    await this.apiService.loadHomework({ username, password });
  }

  @Get('homework/all')
  @UseGuards(AuthGuard)
  async getAllHomework(@Req() request: Request): Promise<HomeworkDto[]> {
    const username = request.cookies['username'];
    const password = request.cookies['password'];

    return await this.apiService.getAllHomework({ username, password });
  }

  @Put('homework/:id')
  @UseGuards(AuthGuard)
  async markCompleted(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ValidationPipe({ transform: true })) markCompleted: MarkCompleted,
    @Req() request: Request,
  ) {
    const username = request.cookies['username'];
    const password = request.cookies['password'];

    await this.apiService.updateEntry(
      { username, password },
      id,
      markCompleted,
    );
  }

  @Post('homework/create')
  @UseGuards(AuthGuard)
  async createHomework(
    @Body(new ValidationPipe({ transform: true }))
    homework: createHomeworkDto,
    @Req() request: Request,
  ) {
    const username = request.cookies['username'];
    const password = request.cookies['password'];

    await this.apiService.createHomework({ username, password }, homework);
  }

  @Get('homework/delete/:id')
  @UseGuards(AuthGuard)
  async deleteEntry(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() request: Request,
  ) {
    const username = request.cookies['username'];
    const password = request.cookies['password'];

    await this.apiService.deleteEntry({ username, password }, id);
  }
}

@Controller('api/food')
export class FoodApiController {
  constructor(private apiService: ApiService) {}

  @Get('load/:week')
  @UseGuards(AuthGuard)
  async loadFoodSchedule(@Param('week') week: string) {
    await this.apiService.loadFoodSchedule(week);
  }

  @Get('latest')
  @UseGuards(AuthGuard)
  async getLatestFoodSchedule() {
    return await this.apiService.getFoodSchedule();
  }
}
