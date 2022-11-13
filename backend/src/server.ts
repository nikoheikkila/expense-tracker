import APIClient from "@backend/api/client";
import AppDataSource from "@backend/config";

const server = APIClient({
	logger: {
		level: process.env.API_LOG_LEVEL,
	},
});

try {
	await AppDataSource.initialize();
	await server.listen({
		host: process.env.API_HOST,
		port: Number(process.env.API_PORT),
	});
} catch (error: unknown) {
	server.log.fatal(error);
	process.exit(1);
}
