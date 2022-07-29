export interface Expense {
	readonly id: number;
	readonly name: string;
	readonly price: number;
	readonly created: Date;
}

class ExpenseTracker {
	private expenses: Expense[];
	constructor() {
		this.expenses = [];
	}
	getExpenses() {
		return this.expenses;
	}
	addExpense(...expenses: Expense[]) {
		if (expenses.length === 0) {
			throw new Error('Expense data must not be empty');
		}

		this.expenses.push(...expenses);
	}
}

export default ExpenseTracker;
