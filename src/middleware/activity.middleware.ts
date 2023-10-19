import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAnalytics } from './user-analytics.entity';
import { Repository } from 'typeorm';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

import { ApiService } from '../api/api.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ActivityMiddleware implements NestMiddleware {
  constructor(
    private apiService: ApiService,
    private databaseService: DatabaseService,
    @InjectRepository(UserAnalytics)
    private readonly userAnalyticRepository: Repository<UserAnalytics>,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const credentials = this.apiService.decodeAuthHeader(
      req.headers['authorization'],
    );

    //query the database for the user
    let user: UserAnalytics;
    try {
      user = await this.userAnalyticRepository.findOneBy({
        username: credentials[0],
      });
    } catch (error) {
      console.log(`error finding Analytic user: ${error}`);
      throw new HttpErrorByCode[500]();
    }

    if (user === null) {
      const new_user = new UserAnalytics();
      
      try {
	      new_user.id = (await this.databaseService.getUserByUsername(credentials[0])).id
      } catch (error) {
	      next()
      }
      
      new_user.username = credentials[0];

      try {
        await this.userAnalyticRepository.insert(new_user);
      } catch (error) {
        console.log(`error creating Analytic user: ${error}`);
        throw new HttpErrorByCode[500]();
      }
    }

    let column: string;

    if (req.url.startsWith('/api/homework/delete/')) {
      column = 'last_delete';
    } else if (req.url.startsWith('/api/homework/create')) {
      column = 'last_create';
    } else if (req.url.startsWith('/api/homework/') && req.method === 'PUT') {
      column = 'last_edit';
    } else if (req.url.startsWith('/api/homework/all')) {
      column = 'last_get';
    }

    try {
      const now = new Date();
      await this.userAnalyticRepository
        .createQueryBuilder()
        .update(UserAnalytics)
        .set({ [column]: now })
        .where('username = :username', { username: credentials[0] })
        .execute();
    } catch (error) {
      console.log(`error updating Analytic user: ${error}`);
      throw new HttpErrorByCode[500]();
    }

    try {
      user = await this.userAnalyticRepository.findOneBy({
        username: credentials[0],
      });
    } catch (error) {
      console.log(`error finding Analytic user: ${error}`);
      throw new HttpErrorByCode[500]();
    }

    next();
  }
}
