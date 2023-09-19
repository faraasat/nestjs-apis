import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './subject.entity';
import { Teacher } from './teacher.entity';

@Controller('school')
export class TrainingController {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  @Post('/create')
  public async savingRelation() {
    // Adding teachers to subjects
    const subject = new Subject();
    subject.name = 'Math';
    const teacher1 = new Teacher();
    teacher1.name = 'John Doe';
    const teacher2 = new Teacher();
    teacher2.name = 'Harry Doe';
    subject.teachers = [teacher1, teacher2];
    return await this.subjectRepository.save(subject);

    // const subject = await this.subjectRepository.findOne({ where: { id: 3 } });

    // How to use One to One
    // const user = new User();
    // const profile = new Profile();

    // user.profile = profile;
    // user.profile = null;
    // Save the user here

    // const teacher1 = await this.teacherRepository.findOne({ where: { id: 5 } });
    // const teacher2 = await this.teacherRepository.findOne({ where: { id: 6 } });

    // Query builder helps maintaining flexibility
    // return await this.subjectRepository
    //   .createQueryBuilder()
    //   .relation(Subject, 'teachers')
    //   .of(subject)
    //   .add([teacher1, teacher2]);
  }

  @Post('/remove')
  public async removingRelation() {
    const subject = await this.subjectRepository.findOne({
      where: { id: 1 },
      relations: ['teachers'],
    });
    // here we are filtering to exclude the teacher with id 1
    subject.teachers = subject.teachers.filter((teacher) => teacher.id !== 3);
    return await this.subjectRepository.save(subject);

    // await this.subjectRepository
    //   .createQueryBuilder('s')
    //   .update()
    //   .set({ name: 'Confidential' })
    //   .execute();
  }
}
