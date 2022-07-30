import { FastifyInstance } from 'fastify';

export const register = (app: FastifyInstance): FastifyInstance => {
	return app.get('/health', async (request, response) => {
		return 200;
	});
};
