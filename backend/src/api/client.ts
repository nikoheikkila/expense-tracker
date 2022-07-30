import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import * as Routes from './routes';

const defaultServerOptions: FastifyServerOptions = {
	logger: {
		level: 'info',
	},
};

const APIClient = (options: FastifyServerOptions = {}): FastifyInstance => {
	return Routes.register(fastify({ ...defaultServerOptions, ...options }));
};

export default APIClient;
