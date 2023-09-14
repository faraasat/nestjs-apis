import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Event } from './events/entities/events.entity';
import { EventsModule } from './events/events.module';
import { AppDummy } from './app.dummy';
import { AppJapanService } from './app.japan.service';
import ormConfig from './config/orm.config';
import ormConfigProd from './config/orm.config.prod';
// import { AppJapanService } from './app.japan.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // so we don't have to re import in other modules
      envFilePath: '.env',
      load: [ormConfig, ormConfigProd], // to load the config
      expandVariables: true, // will fill the variables in env
    }),
    // TypeOrmModule.forRoot({
    //  // values to pass
    // }),
    // forRootAsyn when using config files
    TypeOrmModule.forRootAsync({
      useFactory:
        process.env.NODE_ENV !== 'production' ? ormConfig : ormConfigProd,
    }),
    EventsModule,
  ],
  controllers: [AppController],
  // there are many ways to provide a provider
  // 1st way, pass the provider
  // providers: [AppService],
  // 2nd way, use object and in this way we can pass a different provider by keeping the same name
  providers: [
    {
      provide: AppService,
      // useClass: AppService,
      useClass: AppJapanService, // if passed we will get hello world in japanese
    },
    {
      // we can inject this value by using the name in the Inject decorator
      provide: 'APP_NAME',
      useValue: 'Nest Events Backend!',
    },
    {
      provide: 'MESSAGE',
      inject: [AppDummy],
      useFactory: (app) => `${app.dummy()} Factory`,
    },
    AppDummy,
  ],
})
export class AppModule {}
