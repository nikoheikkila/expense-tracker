import type { Repository } from '../repository';

export interface Expense {
	readonly id: number;
	readonly name: string;
	readonly price: number;
	readonly created: Date;
}

class ExpenseTracker {
	private expenses: Expense[];
	private repository: Repository<Expense>;
	constructor(repository: Repository<Expense>) {
		this.repository = repository;
		this.expenses = [];
	}
	getExpenses() {
		return this.repository.list();
	}
	public async addExpense(...expenses: Expense[]) {
		if (expenses.length === 0) {
			throw new Error('Expense data must not be empty');
		}

		await this.repository.add(...expenses);
	}
}

export default ExpenseTracker;
