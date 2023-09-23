import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Event } from './entities/events.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './entities/attendee.entity';
import { EventsService } from './events.service';
import { ListEvents } from './dtos/list.event';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuardJwt } from 'src/auth/auth-guard.jwt';

@Controller('events')
// this serialization runs on response and transform the reponse. the interceptors intercepts the response
// two strategies, `excludeAll` means not to return anything unless explicitly defined, `exposeAll` means return everything unless specified
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    // @InjectRepository(EventsService)
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true })) // trick to make the classes pre-populate in the query
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents) {
    // this.logger.log(`Hit findAll router`);
    // const events = await this.repository.find();
    // const events =
    //   await this.eventsService.getEventsWithAttendeeCountFiltered();
    // this.logger.debug(`Found ${events.length} events`);
    const events =
      this.eventsService.getEventsWithAttendeeCountFilteredPaginated(filter, {
        total: true,
        currentPage: filter.page,
        limit: 10,
      });
    return events;
  }

  @Get('practice')
  // in array we have or condition in object we have and condition
  async practice() {
    return await this.repository.find({
      // projection with select
      select: ['id', 'name', 'when', 'address', 'description'],
      // cache: 20000,
      where: [
        {
          id: MoreThan(3),
          when: MoreThan(new Date('2021-02-12T13:00:00')),
        },
        { description: Like('%meet%') },
      ],
      // take is for limiting
      take: 2,
      skip: 0,
      order: {
        id: 'DESC',
        // description: 'ASC',
      },
    });
  }

  @Get('practice2')
  async practice2() {
    const event = new Event();
    event.id = 1;

    const attendee = new Attendee();
    attendee.name = 'Farasat';
    attendee.event = event;

    await this.attendeeRepository.save(attendee);

    return await this.repository.findOne({
      where: { id: 1 },
      loadEagerRelations: true,
      relations: ['attendees'],
    });

    /**
     * using cascading
     *
     * const event = await this.repository.findOne(1);
     *
     * const attendee = new Attendee();
     * attendee.name = "Using Cascade";
     * event.attendees.push(attendee)
     *
     * await this.repository.save(event)
     *
     * return event;
     *
     */
  }

  @Get(':id')
  // if we do not write @Param('id') id and write @Param() id we will get and object like {id: "sasd"}
  // ParseIntPipe validates and converts id into number
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // const event = await this.repository.findOne({ where: { id: id } })s;
    const event = await this.eventsService.getEvent(id);

    if (!event) return new NotFoundException();

    return event;
  }

  // these pipes can also be written as new ValidationPipe() if passing an argument in Body @Body(ValidationPipe)
  // but now I have put the ValidationPipe on useGlobalValidator so no need here
  // now if we want to target a specific group in validation pipe `new ValidationPipe({ groups: ['create'] })` we will include it but you have to disable global pipe
  // one more way to add pipe is using @UsePipes()
  // @UsePipes()
  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body()
    input: // new ValidationPipe({ groups: ['create'] })
    CreateEventDto,
    @CurrentUser() user: User,
  ) {
    // return await this.repository.save({
    //   ...input,
    //   when: new Date(input.when),
    // });

    return await this.eventsService.createEvent(input, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id') id,
    @Body()
    input: // new ValidationPipe({ groups: ['update'] })
    UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    // let inputDef = {};

    // if (input.when) {
    //   inputDef = { ...input, when: new Date(input.when) };
    // } else {
    //   inputDef = { ...input };
    // }

    // return await this.repository.update(
    //   { id: id },
    //   {
    //     ...inputDef,
    //   },
    // );

    // const event = await this.repository.findOne({ where: { id: id } });
    const event = await this.eventsService.getEvent(id);

    if (!event) throw new NotFoundException();

    if (event.organizerId !== user.id)
      throw new ForbiddenException(
        null,
        `You are not authorized to change this event`,
      );

    return await this.eventsService.updateEvent(event, input);
  }

  @Delete(':id')
  // to return a different response and 204 not content to return
  @HttpCode(204)
  @UseGuards(AuthGuardJwt)
  async remove(@Param('id') id: number, @CurrentUser() user: User) {
    // const event = await this.repository.delete({ id: id });
    // if (!event) return new NotFoundException();
    // return event;

    // const result = await this.eventsService.deleteEvent(id);
    // if (result.affected !== 1) return new NotFoundException();

    // const event = await this.repository.findOne({ where: { id: id } });
    const event = await this.eventsService.getEvent(id);

    if (!event) throw new NotFoundException();

    if (event.organizerId !== user.id)
      throw new ForbiddenException(
        null,
        `You are not authorized to remove this event`,
      );

    await this.eventsService.deleteEvent(id);
  }
}
