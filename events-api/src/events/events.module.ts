import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/events.entity';
import { EventsController } from './events.controller';
import { Attendee } from './entities/attendee.entity';
import { EventsService } from './events.service';
import { AttendeeService } from './attendee.service';
import { EventAttendeesController } from './event-attendees.controller';
import { EventsOrganizedByUserController } from './events-organized-by-user.controller';
import { CreateUserEventAttendanceController } from './current-user-event-attendance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Attendee]), // for repository
  ],
  controllers: [
    EventsController,
    EventAttendeesController,
    EventsOrganizedByUserController,
    CreateUserEventAttendanceController,
  ],
  providers: [EventsService, AttendeeService],
})
export class EventsModule {}
