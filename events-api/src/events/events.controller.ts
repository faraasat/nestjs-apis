import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Event } from './entities/events.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './entities/attendee.entity';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  @Get()
  async findAll() {
    this.logger.log(`Hit findAll router`);
    const events = await this.repository.find();
    this.logger.debug(`Found ${events.length} events`);
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
    attendee.name = "Farasat";
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
  async findOne(@Param('id', ParseIntPipe) id) {
    const event = await this.repository.findOne({ where: { id: id } });

    if (!event) return new NotFoundException();

    return event;
  }

  // these pipes can also be written as new ValidationPipe() if passing an argument in Body @Body(ValidationPipe)
  // but now I have put the ValidationPipe on useGlobalValidator so no need here
  // now if we want to target a specific group in validation pipe `new ValidationPipe({ groups: ['create'] })` we will include it but you have to disable global pipe
  // one more way to add pipe is using @UsePipes()
  // @UsePipes()
  @Post()
  async create(
    @Body()
    input: // new ValidationPipe({ groups: ['create'] })
    CreateEventDto,
  ) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id,
    @Body()
    input: // new ValidationPipe({ groups: ['update'] })
    UpdateEventDto,
  ) {
    let inputDef = {};

    if (input.when) {
      inputDef = { ...input, when: new Date(input.when) };
    } else {
      inputDef = { ...input };
    }

    return await this.repository.update(
      { id: id },
      {
        ...inputDef,
      },
    );
  }

  @Delete(':id')
  // to return a different response and 204 not content to return
  @HttpCode(204)
  async remove(@Param('id') id) {
    const event = await this.repository.delete({ id: id });

    if (!event) return new NotFoundException();

    return event;
  }
}
