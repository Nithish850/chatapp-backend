import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserDataModel } from 'src/db/model/user_data';
import { InjectModel } from '@nestjs/sequelize';
import * as crypto from 'crypto';
import { IUserData, TokenPayload } from 'src/interface/auth.interface';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectModel(UserDataModel)
    private userDataModel: typeof UserDataModel,
  ) {}

  logger = new Logger(AuthService.name);

  async loginService(payload: LoginDto) {
    try {
      const userData = await this.userDataModel.findOne({
        where: {
          email: payload?.email,
        },
      });
      if (!userData) {
        return {
          error: {
            status: HttpStatus.BAD_GATEWAY,
            message: 'Invalid credentials',
          },
        };
      }
      if (
        !(await this.comparePassword(payload?.password, userData?.pass_word))
      ) {
        return {
          error: {
            status: HttpStatus.BAD_GATEWAY,
            message: 'Invalid credentials',
          },
        };
      }
      const tokenPayload: TokenPayload = {
        id: userData?.id,
        email: userData?.email,
      };

      const getToken = await this.genToken(tokenPayload);

      if (getToken?.error) {
        return { error: getToken?.error };
      }
      return { data: getToken?.data };
    } catch (error) {
      this.logger.error('Error in loginService catch:', error.message);
      return {
        error: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error in loginService catch',
        },
      };
    }
  }

  async signUpService(payload: SignUpDto, req: Request) {
    try {
      const userData = await this.userDataModel.findOne({
        where: {
          email: payload?.email,
        },
      });
      if (userData) {
        return {
          error: {
            status: HttpStatus.BAD_GATEWAY,
            message: 'Already User is Exist',
          },
        };
      }

      const signUpPayload: IUserData = {
        user_name: payload?.user_name,
        email: payload?.email,
        pass_word: await this.hashPassword(payload?.pass_word),
        is_active: false,
        last_logged_in: new Date().toISOString(),
        ip_address: req?.ip as string,
      };

      const createUser = await this.userDataModel.create(signUpPayload);

      if (!createUser) {
        return {
          error: {
            status: HttpStatus.BAD_REQUEST,
            message: 'User not created',
          },
        };
      }

      return { data: createUser };
    } catch (error) {
      this.logger.error('Error in loginService catch:', error.message);
      return {
        error: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error in loginService catch',
        },
      };
    }
  }

  async genToken(payload: TokenPayload) {
    try {
      const token = this.jwtService.sign(payload, {
        secret: process.env.AUTH_SECRET,
      });
      return { data: token };
    } catch (error) {
      this.logger.error('Catch error generating token:', error.message);
      return {
        error: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Catch error in  generating token',
        },
      };
    }
  }

  async comparePassword(
    passWord: string,
    hashPassWord: string,
  ): Promise<boolean> {
    if (hashPassWord === (await this.hashPassword(passWord))) {
      return true;
    }
    return false;
  }

  async hashPassword(passWord: string): Promise<string> {
    try {
      const hashPass = crypto
        .createHash('sha256')
        .update(passWord)
        .digest('hex');
      return hashPass;
    } catch (error) {
      this.logger.log('Error hashing password:', error.message);
      return '';
    }
  }
}
