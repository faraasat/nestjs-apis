import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Event } from './entities/events.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('events')
export class EventsController {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  @Get()
  async findAll() {
    return await this.repository.find();
  }

  @Get()
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

  @Get(':id')
  // if we do not write @Param('id') id and write @Param() id we will get and object like {id: "sasd"}
  async findOne(@Param('id') id) {
    return await this.repository.findOne({ where: { id: id } });
  }

  @Post()
  async create(@Body() input: CreateEventDto) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }

  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
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
    return await this.repository.delete({ id: id });
  }
}
