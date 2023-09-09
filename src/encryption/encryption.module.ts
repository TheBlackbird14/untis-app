import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [],
  providers: [EncryptionService, ConfigService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
