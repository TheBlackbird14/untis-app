import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CronService {
  constructor(private dbService: DatabaseService) {}

  @Cron('0 0 * * *')
  async deleteOldEntries() {
    const now = new Date();
    console.log(
      `--${now.toISOString()}--> Running Cron Job to delete Old Entries`,
    );

    await this.dbService.deleteOldEntries();
  }
}
