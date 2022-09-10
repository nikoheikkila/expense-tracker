import APIClient from './src/api/client';
import AppDataSource from './config';

const server = APIClient({
	logger: {
		level: process.env.API_LOG_LEVEL,
	},
});

try {
	await AppDataSource.initialize();
	await AppDataSource.synchronize();
	await server.listen({
		host: process.env.API_HOST,
		port: Number(process.env.API_PORT),
	});
} catch (error: unknown) {
	server.log.fatal(error);
	process.exit(1);
}
