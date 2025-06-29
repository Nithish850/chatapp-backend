import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UserDataModel } from './model/user_data';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        model: [],
        query: { raw: true },
        synchronize: false,
        logging: false,
        autoLoadModels: true,
        retry: {
          max: 0,
        },
      }),
    }),
    SequelizeModule.forFeature([UserDataModel]),
  ],
  exports: [SequelizeModule],
})
export class DbModule {
  constructor(private sequelize: Sequelize) {}
  logger = new Logger(DbModule.name);
  async onModuleInit() {
    try {
      await this.sequelize.sync({ force: false });
      this.logger.log('Database connected and synchronized');
    } catch (error) {
      this.logger.error('Error synchronizing database:', error.message);
    }
  }
}
