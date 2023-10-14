import { HttpException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}
  decryptString(ciphertext: string, iv: string): string {
    const key: string = this.configService.get<string>('KEY');
    let decipher: crypto.Decipher;
    try {
      decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(key, 'base64'),
        Buffer.from(iv, 'hex'),
      );
    } catch (e) {
      console.log(e.message);
      throw new HttpException('Bad Encryption', 400);
    }
    let decrypted = decipher.update(ciphertext, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted.toString();
  }
}
