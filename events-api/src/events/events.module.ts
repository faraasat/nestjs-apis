import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/events.entity';
import { EventsController } from './events.controller';
import { Attendee } from './entities/attendee.entity';
import { EventsService } from './events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Attendee]), // for repository
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
