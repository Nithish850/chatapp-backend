import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDto, SignUpDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}
  logger = new Logger(AuthController.name);

  @Post('login')
  async login(@Res() res: Response, @Body() body: LoginDto) {
    this.logger.log('Login process started');
    const response = await this.authService.loginService(body);

    if (response?.error) {
      return res.status(HttpStatus.BAD_REQUEST).send(response?.error);
    }
    return res.status(HttpStatus.OK).send(response?.data);
  }

  @Post('signup')
  async signUp(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: SignUpDto,
  ) {
    this.logger.log('Login process started');
    const response = await this.authService.signUpService(body, req);

    if (response?.error) {
      return res.status(HttpStatus.BAD_REQUEST).send(response?.error);
    }
    return res.status(HttpStatus.OK).send(response?.data);
  }
}
