import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { genSalt, hash } from 'bcrypt';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    const { password, username } = authCredentialsDTO;

    const salt = await genSalt();
    const hashedPassword = await this.hashPassword(password, salt);

    const user = this.create({
      password: hashedPassword,
      username,
      salt,
    });

    try {
      await user.save();
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  private async hashPassword(password: string, salt: string) {
    return hash(password, salt);
  }
}
