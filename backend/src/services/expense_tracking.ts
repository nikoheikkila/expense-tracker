import { Expense, expenseSchema, querySchema } from '../../../lib/interfaces';
import { Validator } from '../../../lib/validation';
import type { Repository } from './repository';

export class MissingExpenseError extends Error {}
export class InvalidRequestError extends Error {}

class ExpenseTracker {
	private repository: Repository<Expense>;
	private expenseValidator: Validator;
	private queryValidator: Validator;

	constructor(repository: Repository<Expense>) {
		this.repository = repository;
		this.expenseValidator = Validator.withSchema(expenseSchema);
		this.queryValidator = Validator.withSchema(querySchema);
	}

	public async getExpenses(): Promise<Expense[]> {
		return this.repository.list();
	}

	public async addExpenses(...expenses: Expense[]): Promise<Expense[]> {
		return this.repository.add(...this.expenseValidator.parseArray(expenses));
	}

	public async searchById(id: number): Promise<Expense> {
		const result = await this.repository.get(id);

		if (!result) {
			throw new MissingExpenseError(`Expense with ID ${id} doesn't exist`);
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

	public async updateExpense(id: number, data: Expense): Promise<Expense> {
		const item = await this.searchById(id);
		validateIncompatibleForeignKeys(item, data);

		return this.repository.update(id, data);
	}

	public async deleteExpenses(...ids: number[]): Promise<void> {
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
