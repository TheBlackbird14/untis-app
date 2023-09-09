import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Homework } from './homework.entity';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { UntisUser } from './user.entity';
import { HomeworkState } from './homework-state.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Homework)
    private homeworkRepository: Repository<Homework>,
    @InjectRepository(UntisUser)
    private userRepository: Repository<UntisUser>,
    @InjectRepository(HomeworkState)
    private homeworkStateRepository: Repository<HomeworkState>,
  ) {}

  async createUser(username: string) {
    const user = new UntisUser();
    user.username = username;

    try {
      await this.userRepository.insert(user);
    } catch (error) {
      console.log(`error creating user: ${error}`);
      throw new HttpErrorByCode[500]();
    }
  }

  async getUserByUsername(username: string): Promise<UntisUser | null> {
    let user: UntisUser;
    try {
      user = await this.userRepository
        .createQueryBuilder('UntisUser')
        .where('username = :username', { username: username })
        .getOneOrFail();
    } catch (error) {
      if (error === !EntityNotFoundError) {
        console.log(`error finding user: ${error}`);
      }

      return null;
    }

    return user;
  }

  async createHomeworkEntry(username: string, homework: Homework) {
    const userId = (await this.getUserByUsername(username)).id;
    const check = await this.getHomeworkByID(homework.id);
    if (check !== null) {
      //homework already exists

      //console.log('creating hw entry: hw already exists');

      if (check.students.find((element) => element === userId) !== undefined) {
        // student is already assigned to homework

        //console.log('student is already assigned');

        return;
      } else {
        //console.log('student is not yet assigned');

        try {
          await this.homeworkStateRepository
            .createQueryBuilder()
            .update(Homework)
            .set({ students: () => `array_append(students, ${userId})` })
            .where('id = :homeworkId', { homeworkId: homework.id })
            .execute();
        } catch (error) {
          console.log(`error appending student: ${error}`);
          throw new HttpErrorByCode[500]();
        }

        const stateEntry = new HomeworkState();
        stateEntry.userId = (await this.getUserByUsername(username)).id;
        stateEntry.homeworkId = homework.id;
        stateEntry.completed = false;

        try {
          await this.homeworkStateRepository.insert(stateEntry);
        } catch (error) {
          console.log(`error creating homeworkState entry: ${error}`);
          throw new HttpErrorByCode[500]();
        }
      }
    } else {
      //homework does not exist yet at all

      //console.log('homework does not yet exist');

      homework.students = [userId];

      try {
        await this.homeworkRepository.insert(homework);
      } catch (error) {
        console.log(`error creating homework entry: ${error}`);
        throw new HttpErrorByCode[500]();
      }

      const stateEntry = new HomeworkState();
      stateEntry.userId = (await this.getUserByUsername(username)).id;
      stateEntry.homeworkId = homework.id;
      stateEntry.completed = false;

      try {
        await this.homeworkStateRepository.insert(stateEntry);
      } catch (error) {
        console.log(`error creating homeworkState entry: ${error}`);
        throw new HttpErrorByCode[500]();
      }
    }
  }

  async getHomeworkByID(id: number): Promise<Homework | null> {
    try {
      return await this.homeworkRepository.findOne({ where: { id: id } });
    } catch (error) {
      console.log(`error finding homework: ${error}`);
    }
  }

  async getAllHomework(user: UntisUser): Promise<Homework[] | null> {
    const now = new Date();
    console.log(
      `--${now.toISOString()}--> Data requested by ${user.username} (${
        user.id
      })`,
    );

    let results: Homework[];

    try {
      results = await this.homeworkRepository
        .createQueryBuilder('homework')
        .where(':userId = ANY(homework.students)', { userId: user.id })
        .getMany();
      //.query('SELECT * FROM homework WHERE 1 = ANY(homework.students)');
    } catch (error) {
      console.log(`error finding homework: ${error}`);
      return null;
    }
    //console.log(`query succeeded: ${results}`);

    return results;
  }

  async getCompleted(user: UntisUser, id: number): Promise<boolean> {
    try {
      const result = await this.homeworkStateRepository
        .createQueryBuilder('homework_state')
        .select('homework_state.completed')
        .where('homework_state.homeworkId = :homeworkid', { homeworkid: id })
        .andWhere('homework_state.userId = :userid', { userid: user.id })
        .getOne();

      return result.completed;
    } catch (error) {
      console.log(`error getting homework state: ${error}`);
    }
  }

  async update(user: UntisUser, id: number, data: any) {
    const now = new Date();
    console.log(
      `--${now.toISOString()}--> Updating entry with ID ${id} for user ${
        user.username
      } (${user.id}): `,
      data,
    );

    try {
      await this.homeworkStateRepository
        .createQueryBuilder()
        .update(HomeworkState)
        .set(data)
        .where('userId = :id', { id: user.id })
        .andWhere('homeworkId = :hwid', { hwid: id })
        .execute();
    } catch (error) {
      console.log(`error updating: ${error}`);
      throw new HttpErrorByCode[500]();
    }
  }

  async createHomeworkId(): Promise<number> {
    try {
      const result = await this.homeworkRepository
        .createQueryBuilder('homework')
        .select('Min(homework.id)', 'minValue')
        .getRawOne();

      if (result !== null) {
        if (result['minValue'] > 0) {
          return -1;
        } else {
          return result['minValue'] - 1;
        }
      } else {
        console.log('error querying for lowest id');
      }
    } catch (error) {
      console.log(`query error lowest id: ${error}`);
    }
  }

  async deleteOldEntries() {
    // Calculate the date 1 week ago from the current date
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
      const entries = await this.homeworkRepository
        .createQueryBuilder('homework')
        .select()
        .where('homework.dateDue < :oneWeekAgo', { oneWeekAgo })
        .getMany();

      for (const element of entries) {
        try {
          await this.homeworkStateRepository
            .createQueryBuilder()
            .delete()
            .where('homeworkId = :id', { id: element.id })
            .execute();

          await this.homeworkRepository
            .createQueryBuilder('homework')
            .delete()
            .where('homework.id = :elementId', { elementId: element.id })
            .execute();
        } catch (error) {
          console.log(`error removing old entries: ${error}`);
        }
      }
    } catch (error) {
      console.log(`error removing old entries: ${error}`);
    }
  }

  async deleteEntry(id: number) {
    try {
      await this.homeworkRepository
        .createQueryBuilder('homework')
        .delete()
        .where('homework.id = :id', { id })
        .execute();
    } catch (error) {
      console.log(`failed to delete entry: ${error}`);
      throw new HttpErrorByCode[500]();
    }
  }
}
