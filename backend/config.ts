import { DataSource } from 'typeorm';
import { Expense } from './src/domain/entities';

const env = (key: string, fallback: string): string => process.env[key] ?? fallback;

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: env('DB_HOST', 'localhost'),
	port: Number.parseInt(env('DB_PORT', '5432')),
	username: env('DB_USER', 'postgres'),
	password: env('DB_PASSWORD', 'postgres'),
	database: env('DB_NAME', 'postgres'),
	entities: [Expense],
	synchronize: true,
	logging: false,
	cache: {
		type: 'redis',
		ignoreErrors: true,
		options: {
			url: env('REDIS_URL', 'redis://localhost:6379'),
		},
	},
});
