import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Event } from 'src/events/entities/events.entity';
import { Expose } from 'class-transformer';
import { Attendee } from 'src/events/entities/attendee.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ unique: true })
  @Expose()
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column()
  @Expose()
  firstName: string;

  @Column()
  @Expose()
  lastName: string;

  @OneToOne(() => Profile)
  @JoinTable()
  @Expose()
  profile: Profile;

  @OneToMany(() => Event, (event) => event.organizer)
  @Expose()
  organized: Event[];

  @OneToMany(() => Attendee, (attendee) => attendee.user)
  attended: Attendee[];
}
