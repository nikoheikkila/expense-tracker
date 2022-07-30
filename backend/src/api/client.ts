import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import * as Routes from './routes';
import * as DIContainer from './container';

const APIClient = (options: FastifyServerOptions = {}): FastifyInstance => {
	const app = fastify(options);

	const withContainer = DIContainer.register(app);
	const withRoutes = Routes.register(withContainer);

	return withRoutes;
};

export default APIClient;
