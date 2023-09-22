import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { Event } from './entities/events.entity';
import { AttendeeAnswerEnum } from './entities/attendee.entity';
import { ListEvents, WhenEventFilter } from './dtos/list.event';
import { PaginateOptions, paginate } from 'src/pagination/paginator';

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

  private async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
    let query = this.getEventWithAttendeeCountQuery();

    if (!filter) return query;

    if (filter.when) {
      if (filter.when == WhenEventFilter.All) {
        query = query.andWhere(
          `e.when >= CURDATE() and e.when <= CURDATE() + INTERVAL 1 DAY`,
        );
      }
    }
    if (filter.when) {
      if (filter.when == WhenEventFilter.Tommorrow) {
        query = query.andWhere(
          `e.when >= CURDATE() + INTERVAL 1 DAY and e.when <= CURDATE() + INTERVAL 2 DAY`,
        );
      }
    }
    if (filter.when) {
      if (filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere(`YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)`);
      }
    }
    if (filter.when) {
      if (filter.when == WhenEventFilter.NextWeek) {
        query = query.andWhere(
          `YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1`,
        );
      }
    }

    return query;
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginationOptions: PaginateOptions,
  ) {
    return await paginate(
      await this.getEventsWithAttendeeCountFiltered(filter),
      paginationOptions,
    );
  }

  public async getEvent(id: number): Promise<Event | undefined> {
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

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute();
  }
}
