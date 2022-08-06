import { Expense, expenseSchema } from '../../../lib/interfaces';
import { Validator } from '../../../lib/validation';
import type { Repository } from './repository';

class MissingExpenseError extends Error {}
class TransactionError extends Error {}

class ExpenseTracker {
	private repository: Repository<Expense>;
	private validator: Validator;

	constructor(repository: Repository<Expense>) {
		this.repository = repository;
		this.validator = Validator.withSchema(expenseSchema);
	}

	public async getExpenses(): Promise<Expense[]> {
		return this.repository.list();
	}

	public async addExpenses(...expenses: Expense[]): Promise<Expense[]> {
		return this.repository.add(...this.validator.parseArray(expenses));
	}

	public async searchById(id: number): Promise<Expense> {
		const result = await this.repository.get(id);

		if (!result) {
			throw new MissingExpenseError(`Error: Expense with ID ${id} doesn't exist`);
		}

		return result;
	}

	public async searchByQuery(
		key: string,
		operator: Operator,
		value: unknown,
	): Promise<Expense[]> {
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
		throw new TransactionError(
			'Specify one or more allowed key-value pairs to update the expense',
		);
	}

	const incompatibleKeys = theirKeys.filter((key) => !ourKeys.includes(key));

	if (incompatibleKeys.length > 0) {
		throw new TransactionError(
			`Unrecognized key-value pairs (${incompatibleKeys.join(
				', ',
			)}) used to update the expense`,
		);
	}
};

export default ExpenseTracker;
