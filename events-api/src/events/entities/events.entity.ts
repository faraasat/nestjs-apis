import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Attendee } from './attendee.entity';

@Entity()
export class Event {
  // to make a already primary column primary use @PrimaryColumn() and to create composite keys write @PrimaryColumn() to every composite key
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  when: Date;

  @Column()
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
  attendees: Attendee[];
}
