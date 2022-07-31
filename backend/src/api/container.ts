import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { asFunction, Lifetime } from 'awilix';
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

	const defaultInjectionOptions = {
		lifetime: Lifetime.SINGLETON,
	};

	diContainer.register({
		expenseRepository: asFunction(() => RepositoryFactory.create(), {
			...defaultInjectionOptions,
			dispose: (repository) => repository.clear(),
		}),
		expenseTracker: asFunction((container) => new ExpenseTracker(container.expenseRepository), {
			...defaultInjectionOptions,
		}),
	});

	return app;
};
