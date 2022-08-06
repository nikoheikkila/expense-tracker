import { FastifyInstance, FastifyReply } from 'fastify';
import { FastifyReplyType } from 'fastify/types/type-provider';
import { Expense } from '../../../lib/interfaces';
import { ValidationError } from '../../../lib/validation';
import { InvalidRequestError, MissingExpenseError } from '../services/expense_tracking';

type WithoutId<T> = Omit<T, 'id'>;

interface APIError {
	error: string;
}

interface HealthCheck {
	Body: undefined;
	Reply: undefined;
}

interface AddExpenses {
	Body: Array<WithoutId<Expense>>;
	Reply: Array<Expense> | APIError;
}

interface ListExpenses {
	Body: undefined;
	Reply: Array<Expense> | APIError;
}

interface SearchExpenses {
	Body: {
		key: string;
		operator: Operator;
		value: unknown;
	};
	Reply: Array<Expense> | APIError;
}

interface UpdateExpenses {
	Body: {
		id: number;
		update: WithoutId<Expense>;
	};
	Reply: {
		id: number;
		old: WithoutId<Expense>;
		new: WithoutId<Expense>;
	};
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
		})
		.post<SearchExpenses>('/api/expenses/search', async (request, response) => {
			const tracker = app.diContainer.resolve('expenseTracker');
			const { key, operator, value } = request.body;

			try {
				const expenses = await tracker.searchByQuery(key, operator, value);

				return sendResponse<SearchExpenses['Reply']>(response, 200, expenses);
			} catch (error: unknown) {
				return sendError(response, error);
			}
		})
		.post<UpdateExpenses>('/api/expenses/update', async (request, response) => {
			const tracker = app.diContainer.resolve('expenseTracker');
			const { id, update } = request.body;

			try {
				const item = await tracker.searchById(id);
				const updatedItem = await tracker.updateExpense(item.id!, update);

				return sendResponse<UpdateExpenses['Reply']>(response, 200, {
					id,
					old: item,
					new: updatedItem,
				});
			} catch (error) {
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

	if (isNotFoundError(error)) {
		return sendResponse<APIError>(response, 404, {
			error: `Not Found: ${error.message}`,
		});
	}

	return sendResponse<APIError>(response, 500, { error: `Internal Server Error: ${error}` });
};

const isClientError = (error: unknown): error is ValidationError =>
	error instanceof ValidationError || error instanceof InvalidRequestError;
const isNotFoundError = (error: unknown): error is MissingExpenseError =>
	error instanceof MissingExpenseError;
