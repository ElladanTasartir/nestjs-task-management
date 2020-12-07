import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

interface DBConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
}

const dbConfig = config.get<DBConfig>('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: !!process.env.TYPEORM_SYNC || dbConfig.synchronize,
};
