import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '../types';
import { config } from '../config';
import { readFileSync } from 'fs';
import { join } from 'path';

const ca = readFileSync(join(__dirname, '../../certs/ca.crt')).toString();

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: config.database.url,
      ssl: {
        ca,
        rejectUnauthorized: true
      }
    })
  })
});

export { db }; 