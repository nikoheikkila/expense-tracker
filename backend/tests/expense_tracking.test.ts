import { expect, test, describe } from 'vitest';
import ExpenseTracker, { Expense } from '../src/services/expense_tracking';

describe('Expense Tracking', () => {
	test('adds a single expense', () => {
		const tracker = new ExpenseTracker();
		const expense: Expense = {
			id: 1,
			name: 'Groceries',
			price: 100,
			created: new Date(),
		};

		tracker.addExpense(expense);
		const expenses = tracker.getExpenses();

		expect(expenses).toHaveLength(1);
		expect(expenses[0]).toMatchObject(expense);
	});

	test('adds multiple expenses', () => {
		const tracker = new ExpenseTracker();
		const expenses: Expense[] = [
			{
				id: 1,
				name: 'Groceries',
				price: 100,
				created: new Date(),
			},
			{
				id: 2,
				name: 'Restaurant',
				price: 200,
				created: new Date(),
			},
		];

		tracker.addExpense(...expenses);
		const trackedExpenses = tracker.getExpenses();

		expect(trackedExpenses).toHaveLength(2);
		expect(trackedExpenses).toMatchObject(expenses);
	});

	test('throws error for empty expense', () => {
		const tracker = new ExpenseTracker();
		const expenses: Expense[] = [];

		expect(() => tracker.addExpense(...expenses)).toThrowError(/Expense data must not be empty/);
	});
});
