import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { FetchService } from '../fetch/fetch.service';

@Injectable()
export class CronService {
  constructor(
    private dbService: DatabaseService,
    private fetchService: FetchService,
  ) {}

  @Cron('0 0 * * *')
  async deleteOldEntries() {
    const now = new Date();
    console.log(
      `--${now.toISOString()}--> Running Cron Job to delete Old Entries`,
    );

    await this.dbService.deleteOldEntries();
  }

  //cron job running every week on sunday at 12:00
  @Cron('0 20 * * 5')
  async loadFoodSchedule() {
    const now = new Date();
    console.log(
      `--${now.toISOString()}--> Running Cron Job to load Food Schedule`,
    );

    //create a string in the format "YYYY" + "W" + "WW"

    const startDate = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor(
      (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil(days / 7) + 1;

    const weekString =
      now.getFullYear() + 'W' + weekNumber.toString().padStart(2, '0');

    await this.fetchService.importFood(weekString);
  }
}
