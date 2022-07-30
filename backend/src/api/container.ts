import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { asClass, asFunction, Lifetime, LifetimeType } from 'awilix';
import { FastifyInstance } from 'fastify';
import { Expense } from '../../../lib/interfaces';
import ExpenseTracker from '../services/expense_tracking';
import { Repository, RepositoryFactory } from '../services/repository';

declare module '@fastify/awilix' {
	interface Cradle {
		expenseRepository: Repository<Expense>;
		expenseTracker: ExpenseTracker;
	}
}

export const register = (app: FastifyInstance): FastifyInstance => {
	app.register(fastifyAwilixPlugin);

	diContainer.register({
		expenseRepository: asFunction(() => RepositoryFactory.create()),
	});

	app.addHook('onRequest', (request, response, done) => {
		request.diScope.register({
			expenseTracker: asFunction((container) => new ExpenseTracker(container.expenseRepository)),
		});

		done();
	});

	return app;
};
