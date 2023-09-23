import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Attendee } from './attendee.entity';
import { User } from 'src/auth/entities/user.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Event {
  // to make a already primary column primary use @PrimaryColumn() and to create composite keys write @PrimaryColumn() to every composite key
  @PrimaryGeneratedColumn()
  @Expose() // to tell serializer which properties to expose
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  when: Date;

  @Column()
  @Expose()
  address: string;

  @OneToMany(
    () => Attendee,
    (attendee) => attendee.event,
    {
      cascade: true, // typeorm feature which allows the removal of all related feature if one is deleted - use with caution
    },
    // {
    //   eager: true, // to make all realtions eager
    // }
  )
  @Expose()
  attendees: Attendee[];

  @ManyToOne(() => User, (user) => user.organized)
  @JoinColumn({ name: 'organizerId' })
  @Expose()
  organizer: User;

  @Column({ nullable: true })
  organizerId: number;

  // these all are virtual properties that are never stored
  @Expose()
  attendeeCount?: number;
  @Expose()
  attendeeRejected?: number;
  @Expose()
  attendeeMaybe?: number;
  @Expose()
  attendeeAccepted?: number;
}
