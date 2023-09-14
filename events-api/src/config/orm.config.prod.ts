import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/events.entity';

// this is called default factory function
export default registerAs(
  'orm.config.prod',
  (): TypeOrmModuleOptions => ({
    type: (process.env.DB_TYPE as any) || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: (!isNaN(+process.env.DB_POST) && +process.env.DB_POST) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'nest-events',
    entities: [Event],
    synchronize: false, // do not use on production
    ssl: {
      rejectUnauthorized: false,
      requestCert: true,
    },
    extra: {
      sslmode: 'required ',
    },
  }),
);
