import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsController } from './events/events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Event } from './events/entities/events.entity';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as any) || 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: (!isNaN(+process.env.DB_POST) && +process.env.DB_POST) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'nest-events',
      entities: [Event],
      synchronize: true, // do not use on production
      ssl: {
        rejectUnauthorized: false,
        requestCert: true,
      },
      extra: {
        sslmode: 'required ',
      },
    }),
    TypeOrmModule.forFeature([Event]), // for repository
  ],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}
