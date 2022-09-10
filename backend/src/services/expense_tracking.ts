import { Operator, querySchema } from '../../../lib/interfaces';
import Expense from '../domain/entities/Expense';
import { Validator } from '../../../lib/validation';
import type { IRepository } from './repository';

export class MissingExpenseError extends Error {}
export class InvalidRequestError extends Error {}

class ExpenseTracker {
	private repository: IRepository<Expense>;
	private queryValidator: Validator;

	constructor(repository: IRepository<Expense>) {
		this.repository = repository;
		this.queryValidator = Validator.withSchema(querySchema);
	}

	public async getExpenses(): Promise<Expense[]> {
		return this.repository.list();
	}

	public async addExpenses(...expenses: Expense[]): Promise<Expense[]> {
		if (expenses.length === 0) {
			throw new InvalidRequestError('List of expenses to add cannot be empty');
		}

		return this.repository.add(...expenses);
	}

	public async searchById(ids: string[]): Promise<Expense[]> {
		const result = await this.repository.get(...ids);

		if (result.length === 0) {
			throw new MissingExpenseError(`Expenses with IDs (${ids.join(', ')}) do not exist`);
		}

		return result;
	}

	public async searchByQuery(
		key: string,
		operator: Operator,
		value: unknown,
	): Promise<Expense[]> {
		this.queryValidator.parseObject({ key, operator, value });

		const result = await this.repository.findBy(key, operator, value);

		if (result.length === 0) {
			const query = [key, operator, value].join('');
			throw new MissingExpenseError(`Expense not found with given query: ${query}`);
		}

		return result;
	}

	public async updateExpense(id: string, data: Expense): Promise<Expense> {
		const [item] = await this.searchById([id]);
		validateIncompatibleForeignKeys(item, data);

		return this.repository.update(id, data);
	}

	public async deleteExpenses(...ids: string[]): Promise<void> {
		if (ids.length === 0) {
			throw new InvalidRequestError('List of expense IDs to delete cannot be empty');
		}

		await this.searchById(ids);

		await this.repository.delete(...ids);
	}
}

const validateIncompatibleForeignKeys = (a: Expense, b: Expense): void => {
	const ourKeys = Object.keys(a);
	const theirKeys = Object.keys(b);

	if (theirKeys.length === 0) {
		throw new InvalidRequestError(
			'Specify one or more allowed key-value pairs to update the expense',
		);
	}

	const incompatibleKeys = theirKeys.filter((key) => !ourKeys.includes(key));

	if (incompatibleKeys.length > 0) {
		throw new InvalidRequestError(
			`Unrecognized key-value pairs (${incompatibleKeys.join(
				', ',
			)}) used to update the expense`,
		);
	}
};

export default ExpenseTracker;
