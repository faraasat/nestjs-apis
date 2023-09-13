import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

// this partial type makes the all properties to optional
export class UpdateEventDto extends PartialType(CreateEventDto) {}
