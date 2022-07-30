import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import * as Routes from './routes';

const APIClient = (options: FastifyServerOptions = {}): FastifyInstance => {
	return Routes.register(fastify(options));
};

export default APIClient;
