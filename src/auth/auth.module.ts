import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [JwtModule, DbModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
