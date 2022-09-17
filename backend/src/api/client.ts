import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import * as DIContainer from '@backend/api/container';
import * as Routes from '@backend/api/routes';

const APIClient = (options: FastifyServerOptions = {}): FastifyInstance => {
	const app = fastify(options);

	const withContainer = DIContainer.register(app);
	const withRoutes = Routes.register(withContainer);

	return withRoutes;
};

export default APIClient;
