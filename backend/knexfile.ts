import path from 'node:path';
import type { Knex } from 'knex';
import config from './config';

const { database } = config();

const migrations: Knex.MigratorConfig = {
	tableName: 'migrations',
	directory: path.resolve(process.cwd(), 'migrations'),
	extension: 'ts',
};

const migrationConfiguration: Knex.Config = {
	...database,
	migrations,
};

export default migrationConfiguration;
