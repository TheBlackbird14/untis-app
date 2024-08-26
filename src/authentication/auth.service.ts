import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { ApiService } from '../api/api.service';

@Injectable()
export class AuthService {
  constructor(
    private dbService: DatabaseService,
    private apiService: ApiService,
  ) {}

  async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ encrypted: string; IV: string }> {
    if (
      await this.apiService.checkUserInUntis(
        credentials.username,
        credentials.password,
      )
    ) {
      //if auth works in untis

      //console.log('passed auth');

      if (!(await this.apiService.checkUserInDB(credentials.username))) {
        //if user is not yet registered

        //console.log('user not yet registered');

        const now = new Date();
        console.log(
          `--${now.toISOString()}--> Creating new user ${credentials.username}`,
        );

        await this.dbService.createUser(credentials.username);
      } else {
        //console.log('user already registered');
      }
    } else {
      throw new HttpException('Bad auth', HttpStatus.FORBIDDEN);
    }

    let KEY = await this.dbService.getUserEncryption(credentials.username);

    if (!KEY) {
      KEY = crypto.randomBytes(32).toString('hex');
    }

    // Generate a random key and encrypt the users credentials using aes-256-cbc encryption

    const IV = crypto.randomBytes(16).toString('hex');

    const phrase = btoa(
      encodeURIComponent(`${credentials.username}:${credentials.password}`),
    );

    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(KEY, 'hex'),
      Buffer.from(IV, 'hex'),
    );
    let encrypted = cipher.update(phrase, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Store the encrypted credentials in the database
    await this.dbService.saveUserEncryption(credentials.username, KEY);

    return { encrypted, IV };
  }

  async validateUser(encrypted: string, IV: string, username: string) {
    const key = await this.dbService.getUserEncryption(username);

    if (!key) {
      return false;
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key, 'hex'),
      Buffer.from(IV, 'hex'),
    );
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    const [decUsername, decPassword] = decodeURIComponent(
      atob(decrypted),
    ).split(':');

    if (decUsername === username) {
      return { username: decUsername, password: decPassword };
    } else {
      return false;
    }
  }
}
