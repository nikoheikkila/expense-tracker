import { Expense } from '../../../lib/interfaces';
import type { Mutation, Predicate, Repository } from '../repository';

type SearchPredicate = Predicate<Expense>;

class InvalidExpenseData extends Error {}
class MissingExpenseError extends Error {}
class ExpenseTransactionError extends Error {}

class ExpenseTracker {
	private repository: Repository<Expense>;
	constructor(repository: Repository<Expense>) {
		this.repository = repository;
	}

	public async getExpenses(): Promise<Expense[]> {
		return this.repository.list();
	}

	public async addExpenses(...expenses: Expense[]): Promise<void> {
		if (expenses.length === 0) {
			throw new InvalidExpenseData('Expense data must not be empty');
		}

		await this.repository.add(...expenses);
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
}

export default ExpenseTracker;
