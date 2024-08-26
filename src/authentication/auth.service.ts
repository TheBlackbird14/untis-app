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
  }): Promise<string> {
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

    // Generate a random key and encrypt the users credentials using aes-256-cbc encryption

    const KEY = crypto.randomBytes(32).toString('hex');
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
    await this.dbService.saveUserEncryption(credentials.username, KEY, IV);

    return encrypted;
  }

  async validateUser(token: string, username: string) {
    const user = await this.dbService.getUserEncryption(username);

    if (!user) {
      return false;
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(user.key, 'hex'),
      Buffer.from(user.iv, 'hex'),
    );
    let decrypted = decipher.update(token, 'base64', 'utf8');
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
