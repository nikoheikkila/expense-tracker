import { Knex } from 'knex';

export interface AppConfig {
	database: Knex.Config;
}

const env = (key: string, fallback: string): string => process.env[key] ?? fallback;

const config = (): AppConfig => ({
	database: {
		client: env('DB_CLIENT', 'pg'),
		version: env('DB_VERSION', '14'),
		connection: {
			host: env('DB_HOST', '127.0.0.1'),
			port: Number.parseInt(env('DB_PORT', '5432')),
			user: env('DB_USER', 'postgres'),
			password: env('DB_PASSWORD', 'postgres'),
			database: env('DB_DATABASE', 'database'),
		},
		pool: {
			min: Number.parseInt(env('DB_POOL_MIN', '2')),
			max: Number.parseInt(env('DB_POOL_MAX', '10')),
		},
	},
});

export default config;
