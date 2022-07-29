import { expect, test, describe, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/repository';
import ExpenseTracker, { Expense } from '../src/services/expense_tracking';

describe('Expense Tracking', () => {
	let tracker: ExpenseTracker;

	beforeEach(() => {
		tracker = new ExpenseTracker(new InMemoryRepository<Expense>());
	});

	describe('Adding expenses', () => {
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

		test('throws error when adding empty expense', async () => {
			const expenses: Expense[] = [];

			expect(() => tracker.addExpense(...expenses)).rejects.toThrow(/Expense data must not be empty/);
		});
	});

	describe('Searching expenses', () => {
		test('finds expense by ID', async () => {
			const expectedId = 10;
			const expenses: Expense[] = [
				{
					id: expectedId,
					name: 'Groceries',
					price: 100,
					created: new Date(),
				},
				{
					id: 20,
					name: 'Movies',
					price: 200,
					created: new Date(),
				},
			];

			await tracker.addExpense(...expenses);
			const foundExpenses = await tracker.searchExpenses((expense) => expense.id === expectedId);

			expect(foundExpenses).toHaveLength(1);
			expect(foundExpenses[0].id).toBe(expectedId);
		});

		test('finds expense by matching the name', async () => {
			const expectedName = /Movie/;
			const expenses: Expense[] = [
				{
					id: 10,
					name: 'Groceries',
					price: 100,
					created: new Date(),
				},
				{
					id: 20,
					name: 'Movies',
					price: 200,
					created: new Date(),
				},
			];

			await tracker.addExpense(...expenses);
			const foundExpenses = await tracker.searchExpenses((expense) => expectedName.test(expense.name));

			expect(foundExpenses).toHaveLength(1);
			expect(foundExpenses[0].name).toMatch(expectedName);
		});

		test('finds expense by comparing the price range', async () => {
			const minimumPrice = 150;
			const maximumPrice = 250;
			const expenses: Expense[] = [
				{
					id: 10,
					name: 'Groceries',
					price: 100,
					created: new Date(),
				},
				{
					id: 20,
					name: 'Movies',
					price: 200,
					created: new Date(),
				},
			];

			await tracker.addExpense(...expenses);
			const foundExpenses = await tracker.searchExpenses((expense) => expense.price >= minimumPrice && expense.price <= maximumPrice);

			expect(foundExpenses).toHaveLength(1);
			expect(foundExpenses[0].price).toBeGreaterThan(minimumPrice);
			expect(foundExpenses[0].price).toBeLessThan(maximumPrice);
		});

		test('throws error when expense is not found by predicate', async () => {
			expect(() => tracker.searchExpenses((expense) => expense.id === 1)).rejects.toThrow(/Expense not found with given query/);
		});
	});
});
