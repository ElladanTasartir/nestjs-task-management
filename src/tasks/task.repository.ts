import { InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');

  async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    const task = this.create({
      ...createTaskDTO,
      status: TaskStatus.OPEN,
      user,
    });
    try {
      await this.save(task);
    } catch (err) {
      this.logger.log(
        `Failed to create a task for user "${
          user.username
        }". Data: ${JSON.stringify(createTaskDTO)}`,
        err.stack,
      );
      throw new InternalServerErrorException();
    }

    delete task.user;

    return task;
  }

  async getTasks(filterDTO: GetTasksFilterDTO, user: User): Promise<Task[]> {
    const { status, search } = filterDTO;

    const query = this.createQueryBuilder('task');

    query.where('task.userId = :userId', {
      userId: user.id,
    });

    if (status) {
      query.andWhere('task.status = :status', {
        status,
      });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (err) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}", DTO: ${JSON.stringify(
          filterDTO,
        )}`,
        err.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
