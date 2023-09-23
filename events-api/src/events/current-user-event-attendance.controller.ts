import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dtos/create-attendee.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuardJwt } from 'src/auth/auth-guard.jwt';

@Controller('events-attendance')
@SerializeOptions({ strategy: 'excludeAll' })
export class CreateUserEventAttendanceController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly attendeeService: AttendeeService,
  ) {}

  @Get()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
  ) {
    return await this.eventsService.getEventsAttendedByUserIdQueryPaginated(
      user.id,
      { limit: 6, currentPage: page },
    );
  }

  @Get(':eventId')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User,
  ) {
    const attendance = await this.attendeeService.findOneByEventIdAndUserId(
      eventId,
      user.id,
    );

    if (!attendance) throw new NotFoundException();

    return attendance;
  }

  @Put(':eventId')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async createOrUpdate(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() input: CreateAttendeeDto,
    @CurrentUser() user: User,
  ) {
    return this.attendeeService.createOrUpdate(input, eventId, user.id);
  }
}
