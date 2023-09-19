import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './entities/events.entity';
import { AttendeeAnswerEnum } from './entities/attendee.entity';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(Event.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  private getEventsBaseQuery() {
    return this.eventsRepository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC');
  }

  public async getEvent(id: number): Promise<Event> {
    const query = this.getEventWithAttendeeCountQuery().andWhere('e.id = :id', {
      id,
    });

    this.logger.debug(query.getSql());

    return await query.getOne();
  }

  public getEventWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeAccepted', // virtual field name
        'e.attendees', // make relation on?
        'attendee', // to define inline query
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe', // virtual field name
        'e.attendees', // make relation on?
        'attendee', // to define inline query
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected', // virtual field name
        'e.attendees', // make relation on?
        'attendee', // to define inline query
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      );
  }
}
