import { FastifyReply } from 'fastify';
import { FastifyInstance } from 'fastify';
import { Expense } from '../../../lib/interfaces';
import { ValidationError } from '../../../lib/validation';

interface APIError {
	error: string;
}

interface HealthCheck {
	Reply: null;
}

interface AddExpenses {
	Body: Array<Pick<Expense, 'name' | 'price' | 'created'>>;
	Reply: Array<Expense> | APIError;
}

export const register = (app: FastifyInstance): FastifyInstance => {
	return app
		.get<HealthCheck>('/health', async function (_, response) {
			return sendResponse(response, 200);
		})
		.put<AddExpenses>('/api/expenses/add', async function (request, response) {
			const { body } = request;
			const tracker = app.diContainer.resolve('expenseTracker');

			try {
				const filedExpenses = await tracker.addExpenses(...body);

				return sendResponse(response, 201, filedExpenses);
			} catch (error: unknown) {
				return sendError(response, error);
			}
		});
};

const sendResponse = <P>(response: FastifyReply, statusCode: number, payload?: P): FastifyReply => {
	return response.status(statusCode).send(payload);
};

const sendError = (response: FastifyReply, error: unknown): FastifyReply => {
	if (isClientError(error)) {
		return sendResponse(response, 400, { error: `Bad Request: ${error.message}` });
	}

	if (isServerError(error)) {
		return sendResponse(response, 500, { error: `Internal Server Error: ${error.message}` });
	}

	return sendResponse(response, 500, { error: `Unknown Error: ${error}` });
};

const isClientError = (error: unknown): error is ValidationError => error instanceof ValidationError;
const isServerError = (error: unknown): error is Error => error instanceof Error && !isClientError(error);
