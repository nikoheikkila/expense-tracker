import { Expense } from '../../../lib/interfaces';
import type { Mutation, Predicate, Repository } from '../repository';

type SearchPredicate = Predicate<Expense>;

class ExpenseTracker {
	private repository: Repository<Expense>;
	constructor(repository: Repository<Expense>) {
		this.repository = repository;
	}

	public async getExpenses() {
		return this.repository.list();
	}

	public async addExpenses(...expenses: Expense[]) {
		if (expenses.length === 0) {
			throw new Error('Expense data must not be empty');
		}

		await this.repository.add(...expenses);
	}

	public async searchExpenses(predicate: SearchPredicate) {
		const result = await this.repository.findBy(predicate);

		if (result.length === 0) {
			throw new Error(`Expense not found with given query: ${predicate}`);
		}

		return result;
	}

	public async updateExpense(id: number, data: Partial<Expense>): Promise<void> {
		const mutation: Mutation<Expense> = (item) => ({ ...item, ...data });

		try {
			await this.repository.update(id, mutation);
		} catch (error: unknown) {
			throw new Error(`Couldn't update expense. ${error}`);
		}
	}
}

export default ExpenseTracker;
