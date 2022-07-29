import { Expense, expenseSchema } from '../../../lib/interfaces';
import { Validator } from '../../../lib/validation';
import type { Mutation, Predicate, Repository } from '../repository';

type SearchPredicate = Predicate<Expense>;

class MissingExpenseError extends Error {}
class ExpenseTransactionError extends Error {}

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

	public async addExpenses(...expenses: Expense[]): Promise<void> {
		await this.repository.add(...this.validator.parseArray(expenses));
	}

	public async searchExpenses(predicate: SearchPredicate): Promise<Expense[]> {
		const result = await this.repository.findBy(predicate);

		if (result.length === 0) {
			throw new MissingExpenseError(`Expense not found with given query: ${predicate}`);
		}

		return result;
	}

	public async updateExpense(id: number, data: Partial<Expense>): Promise<void> {
		const mutation: Mutation<Expense> = (item) => ({ ...item, ...data });

		try {
			await this.repository.update(id, mutation);
		} catch (error: unknown) {
			throw new ExpenseTransactionError(`Couldn't update expense. ${error}`);
		}
	}

	public async deleteExpenses(...ids: number[]): Promise<void> {
		await this.repository.delete(...ids);
	}
}

export default ExpenseTracker;
