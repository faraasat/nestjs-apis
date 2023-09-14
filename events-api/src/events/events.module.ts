import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/events.entity';
import { EventsController } from './events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]), // for repository
  ],
  controllers: [EventsController],
})
export class EventsModule {}
