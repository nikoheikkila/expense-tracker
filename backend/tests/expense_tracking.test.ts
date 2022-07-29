import { expect, test, describe, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/repository';
import ExpenseTracker, { Expense } from '../src/services/expense_tracking';

describe('Expense Tracking', () => {
	let tracker: ExpenseTracker;

	beforeEach(() => {
		tracker = new ExpenseTracker(new InMemoryRepository<Expense>());
	});

	test('adds a single expense', async () => {
		const expense: Expense = {
			id: 1,
			name: 'Groceries',
			price: 100,
			created: new Date(),
		};

		await tracker.addExpense(expense);
		const expenses = await tracker.getExpenses();

		expect(expenses).toHaveLength(1);
		expect(expenses[0]).toMatchObject(expense);
	});

	test('adds multiple expenses', async () => {
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

		await tracker.addExpense(...expenses);
		const trackedExpenses = await tracker.getExpenses();

		expect(trackedExpenses).toHaveLength(2);
		expect(trackedExpenses).toMatchObject(expenses);
	});

	test('throws error for empty expense', async () => {
		const expenses: Expense[] = [];

		expect(() => tracker.addExpense(...expenses)).rejects.toThrow(/Expense data must not be empty/);
	});
});
