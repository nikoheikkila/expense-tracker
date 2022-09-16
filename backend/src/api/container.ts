import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { asFunction, Lifetime } from 'awilix';
import { FastifyInstance } from 'fastify';
import Expense from '../domain/entities/Expense';
import ExpenseTracker from '../services/expense_tracking';
import { IRepository, ExpenseRepositoryFactory } from '../services/repository';

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
		expenseRepository: asFunction(() => ExpenseRepositoryFactory.withSQLDatabase(), {
			...defaultInjectionOptions,
		}),
		expenseTracker: asFunction((container) => new ExpenseTracker(container.expenseRepository), {
			...defaultInjectionOptions,
		}),
	});

	return app;
};
