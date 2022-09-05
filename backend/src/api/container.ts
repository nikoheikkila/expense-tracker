import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { asFunction, asValue, Lifetime } from 'awilix';
import { FastifyInstance } from 'fastify';
import config from '../../config';
import { Expense } from '../domain/entities';
import ExpenseTracker from '../services/expense_tracking';
import { IRepository, RepositoryFactory } from '../services/repository';

declare module '@fastify/awilix' {
	interface Cradle {
		expenseRepository: IRepository<Expense>;
		expenseTracker: ExpenseTracker;
	}
}

export const register = (app: FastifyInstance): FastifyInstance => {
	app.register(fastifyAwilixPlugin);

	const defaultInjectionOptions = {
		lifetime: Lifetime.SINGLETON,
	};

	diContainer.register({
		expenseRepository: asFunction(() => RepositoryFactory.withSQLDatabase(Expense), {
			...defaultInjectionOptions,
			dispose: (repository) => repository.clear(),
		}),
		expenseTracker: asFunction((container) => new ExpenseTracker(container.expenseRepository), {
			...defaultInjectionOptions,
		}),
	});

	return app;
};
