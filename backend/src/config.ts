import { DataSource } from 'typeorm';
import path from 'node:path';

const env = (key: string, fallback: string): string => process.env[key] ?? fallback;

const environment = env('NODE_ENV', 'development');
const isProduction = environment === 'production';
const isTesting = environment === 'test';

const getEntities = async () => {
	if (isTesting) {
		const entities = await import('./domain/entities/Expense');
		return Object.values(entities);
	}

	return [path.join('domain', 'entities', '*.ts')];
};

const AppDataSource = new DataSource({
	type: 'postgres',
	host: env('DB_HOST', 'localhost'),
	port: Number.parseInt(env('DB_PORT', '5432')),
	username: env('DB_USER', 'postgres'),
	password: env('DB_PASSWORD', 'postgres'),
	database: env('DB_NAME', 'postgres'),
	entities: await getEntities(),
	synchronize: !isProduction,
	migrationsRun: isProduction,
	migrations: ['migrations/*.js'],
	logging: false,
	cache: {
		type: 'redis',
		ignoreErrors: !isProduction,
		options: {
			url: env('REDIS_URL', 'redis://localhost:6379'),
		},
	},
});

export default AppDataSource;
