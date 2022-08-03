import { Expense, expenseSchema } from '../../../lib/interfaces';
import { Validator } from '../../../lib/validation';
import type { Mutation, Predicate, Repository } from './repository';

class MissingExpenseError extends Error {}

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

	public async searchByQuery(predicate: Predicate<Expense>): Promise<Expense[]> {
		const result = await this.repository.findBy(predicate);

		if (result.length === 0) {
			throw new MissingExpenseError(`Expense not found with given query: ${predicate}`);
		}

		return result;
	}

	public async updateExpense(id: number, data: Expense): Promise<Expense> {
		const mutation: Mutation<Expense> = (item) => ({ ...item, ...data });

		return this.repository.update(id, mutation);
	}

	public async deleteExpenses(...ids: number[]): Promise<void> {
		await this.repository.delete(...ids);
	}
}

export default ExpenseTracker;
