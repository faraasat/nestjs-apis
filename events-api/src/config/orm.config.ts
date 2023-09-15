import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Attendee } from 'src/events/entities/attendee.entity';
import { Event } from 'src/events/entities/events.entity';
import { Subject } from 'src/school/subject.entity';
import { Teacher } from 'src/school/teacher.entity';

// this is called default factory function
export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: (process.env.DB_TYPE as any) || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: (!isNaN(+process.env.DB_POST) && +process.env.DB_POST) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'nest-events',
    entities: [Event, Attendee, Subject, Teacher],
    autoLoadEntities: true,
    synchronize: true, // do not use on production
    ssl: {
      rejectUnauthorized: false,
      requestCert: true,
    },
    extra: {
      sslmode: 'required ',
    },
  }),
);
