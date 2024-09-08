import { Injectable, NestMiddleware, Req } from '@nestjs/common';
import { Request, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAnalytics } from './user-analytics.entity';
import { Repository } from 'typeorm';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class ActivityMiddleware implements NestMiddleware {
  constructor(
    private databaseService: DatabaseService,
    @InjectRepository(UserAnalytics)
    private readonly userAnalyticRepository: Repository<UserAnalytics>,
  ) {}
  async use(@Req() req: Request, res: Response, next: NextFunction) {
    const username = req.cookies['username'].toLowerCase();

    if (username === "") {
      next();
    }

    //query the database for the user
    let user: UserAnalytics;
    try {
      user = await this.userAnalyticRepository.findOneBy({
        username: username,
      });
    } catch (error) {
      console.log(`error finding Analytic user: ${error}`);
      throw new HttpErrorByCode[500]();
    }

    if (user === null) {
      const new_user = new UserAnalytics();

      try {
        new_user.id = (
          await this.databaseService.getUserByUsername(username)
        ).id;
      } catch (error) {
        next();
      }

      new_user.username = username;

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
        .where('username = :username', { username: username })
        .execute();
    } catch (error) {
      console.log(`error updating Analytic user: ${error}`);
      throw new HttpErrorByCode[500]();
    }

    try {
      await this.userAnalyticRepository.findOneBy({
        username: username,
      });
    } catch (error) {
      console.log(`error finding Analytic user: ${error}`);
      throw new HttpErrorByCode[500]();
    }

    next();
  }
}
