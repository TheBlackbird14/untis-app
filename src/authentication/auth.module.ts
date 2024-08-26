import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../database/database.module';
import { ApiModule } from '../api/api.module';

@Module({
  controllers: [],
  providers: [AuthService],
  imports: [DatabaseModule, forwardRef(() => ApiModule)],
  exports: [AuthService],
})
export class AuthModule {}
