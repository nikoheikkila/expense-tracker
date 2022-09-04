import migrationConfiguration from './knexfile';
import knex from 'knex';
import APIClient from './src/api/client';

const server = APIClient({
	logger: {
		level: process.env.API_LOG_LEVEL,
	},
});

try {
	await knex(migrationConfiguration).migrate.latest();
	await server.listen({
		host: process.env.API_HOST,
		port: Number(process.env.API_PORT),
	});
} catch (error: unknown) {
	server.log.fatal(error);
	process.exit(1);
}
