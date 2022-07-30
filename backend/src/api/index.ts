import APIClient from './client';

const { API_HOST = '0.0.0.0', API_PORT = '54321' } = process.env;

const server = APIClient();

try {
	server.log.info(`Listening to requests on ${API_HOST}:${API_PORT}`);
	await server.listen({
		host: API_HOST,
		port: Number(API_PORT),
	});
} catch (error: unknown) {
	server.log.fatal(error);
	process.exit(1);
}
