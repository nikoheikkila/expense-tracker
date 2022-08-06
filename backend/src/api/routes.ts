import { FastifyInstance, FastifyReply } from 'fastify';
import { FastifyReplyType } from 'fastify/types/type-provider';
import { Expense } from '../../../lib/interfaces';
import { ValidationError } from '../../../lib/validation';

interface APIError {
	error: string;
}

interface HealthCheck {
	Body: undefined;
	Reply: undefined;
}

interface AddExpenses {
	Body: Array<Omit<Expense, 'id'>>;
	Reply: Array<Expense> | APIError;
}

interface ListExpenses {
	Body: undefined;
	Reply: Array<Expense> | APIError;
}

export const register = (app: FastifyInstance): FastifyInstance => {
	return app
		.get<HealthCheck>('/health', async function (_, response) {
			return sendResponse<HealthCheck['Reply']>(response, 200);
		})
		.put<AddExpenses>('/api/expenses/add', async function (request, response) {
			const { body } = request;
			const tracker = app.diContainer.resolve('expenseTracker');

			try {
				const filedExpenses = await tracker.addExpenses(...body);

				return sendResponse<AddExpenses['Reply']>(response, 201, filedExpenses);
			} catch (error: unknown) {
				return sendError(response, error);
			}
		})
		.get<ListExpenses>('/api/expenses/list', async (_, response) => {
			const tracker = app.diContainer.resolve('expenseTracker');

			try {
				const expenses = await tracker.getExpenses();

				return sendResponse<ListExpenses['Reply']>(response, 200, expenses);
			} catch (error: unknown) {
				return sendError(response, error);
			}
		});
};

const sendResponse = <P extends FastifyReplyType>(
	response: FastifyReply,
	statusCode: number,
	payload?: P,
): FastifyReply => {
	return response.status(statusCode).send(payload);
};

const sendError = (response: FastifyReply, error: unknown): FastifyReply => {
	if (isClientError(error)) {
		return sendResponse<APIError>(response, 400, { error: `Bad Request: ${error.message}` });
	}

	if (isServerError(error)) {
		return sendResponse<APIError>(response, 500, {
			error: `Internal Server Error: ${error.message}`,
		});
	}

	return sendResponse<APIError>(response, 500, { error: `Unknown Error: ${error}` });
};

const isClientError = (error: unknown): error is ValidationError =>
	error instanceof ValidationError;
const isServerError = (error: unknown): error is Error =>
	error instanceof Error && !isClientError(error);
