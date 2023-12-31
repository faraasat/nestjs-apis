import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './events.entity';
import { Expose } from 'class-transformer';
import { User } from 'src/auth/entities/user.entity';

export enum AttendeeAnswerEnum {
  Accepted = 1,
  Maybe,
  Rejected,
}

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  // @Column()
  // @Expose()
  // name: string;

  @ManyToOne(() => Event, (event) => event.attendees, {
    nullable: false,
  })
  //   @JoinColumn({
  //     name: 'event_id',
  //   })
  event: Event;

  eventId: number;

  @Column('enum', {
    enum: AttendeeAnswerEnum,
    default: AttendeeAnswerEnum.Accepted,
  })
  @Expose()
  answer: AttendeeAnswerEnum;

  @ManyToOne(() => User, (user) => user.attended)
  @Expose()
  user: User;

  @Column()
  userId: number;
}
