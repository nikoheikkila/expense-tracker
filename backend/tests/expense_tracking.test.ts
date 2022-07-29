import { expect, test, describe, beforeEach } from 'vitest';
import { Expense } from '../../lib/interfaces';
import { InMemoryRepository } from '../src/repository';
import ExpenseTracker from '../src/services/expense_tracking';

const generateExpenseFixture = (id: number, name: string = 'Item', price: number = 100): Expense => {
	return {
		id,
		name,
		price,
		created: new Date(),
	};
};

describe('Expense Tracking', () => {
	let tracker: ExpenseTracker;

	beforeEach(() => {
		tracker = new ExpenseTracker(new InMemoryRepository<Expense>());
	});

	describe('Adding expenses', () => {
		test('adds a single expense', async () => {
			const expense: Expense = generateExpenseFixture(1);

			await tracker.addExpenses(expense);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(1);
			expect(expenses[0]).toMatchObject(expense);
		});

		test('adds multiple expenses', async () => {
			const expenses: Expense[] = [generateExpenseFixture(1), generateExpenseFixture(2)];

			await tracker.addExpenses(...expenses);
			const trackedExpenses = await tracker.getExpenses();

			expect(trackedExpenses).toHaveLength(2);
			expect(trackedExpenses).toMatchObject(expenses);
		});

		test('throws error when adding empty expense', async () => {
			expect(() => tracker.addExpenses()).rejects.toThrow(/Input data must not be empty/);
		});
	});

	describe('Searching expenses', () => {
		test('finds expense by ID', async () => {
			const expectedId = 10;
			const expenses: Expense[] = [generateExpenseFixture(expectedId), generateExpenseFixture(expectedId + 1)];

			await tracker.addExpenses(...expenses);
			const foundExpenses = await tracker.searchExpenses((expense) => expense.id === expectedId);

			expect(foundExpenses).toHaveLength(1);
			expect(foundExpenses[0].id).toBe(expectedId);
		});

		test('finds expense by matching the name', async () => {
			const expectedName = /Movie Ticket/;
			const expenses: Expense[] = [generateExpenseFixture(1, 'Groceries'), generateExpenseFixture(2, 'Movie Tickets')];

			await tracker.addExpenses(...expenses);
			const foundExpenses = await tracker.searchExpenses((expense) => expectedName.test(expense.name));

			expect(foundExpenses).toHaveLength(1);
			expect(foundExpenses[0].name).toMatch(expectedName);
		});

		test('finds expenses by comparing the price range', async () => {
			const minimumPrice = 150;
			const maximumPrice = 250;
			const expenses: Expense[] = [
				generateExpenseFixture(1, 'Groceries', minimumPrice - 1),
				generateExpenseFixture(2, 'Groceries', minimumPrice),
				generateExpenseFixture(3, 'Groceries', maximumPrice),
				generateExpenseFixture(4, 'Groceries', maximumPrice + 1),
			];

			await tracker.addExpenses(...expenses);
			const foundExpenses = await tracker.searchExpenses((expense) => expense.price >= minimumPrice && expense.price <= maximumPrice);

			expect(foundExpenses).toHaveLength(2);
		});

		test('throws error when expense is not found by predicate', async () => {
			expect(() => tracker.searchExpenses((expense) => expense.id === 1)).rejects.toThrow(/Expense not found with given query/);
		});
	});

	describe('Updating expenses', () => {
		test('updates an existing expense with new details', async () => {
			await tracker.addExpenses(generateExpenseFixture(1, 'Old Name', 100));

			const newDetails = { name: 'New Name', price: 200 };
			await tracker.updateExpense(1, newDetails);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(1);
			expect(expenses[0]).toMatchObject(newDetails);
		});

		test('throws error when updating a missing expense', async () => {
			expect(() => tracker.updateExpense(1, { name: 'New Name' })).rejects.toThrow(/Couldn't update expense. Error: Item with ID 1 doesn't exist/);
		});
	});

	describe('Deleting a single expense', () => {
		test('deletes an existing expense', async () => {
			await tracker.addExpenses(generateExpenseFixture(1), generateExpenseFixture(2));

			await tracker.deleteExpenses(1);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(1);
		});

		test('deletes multiple existing expenses', async () => {
			await tracker.addExpenses(generateExpenseFixture(1), generateExpenseFixture(2));

			await tracker.deleteExpenses(1, 2);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(0);
		});
	});

	describe('Validating expense data', () => {
		test('throws validation error for empty name', async () => {
			const invalidExpense = generateExpenseFixture(1, '');

			expect(() => tracker.addExpenses(invalidExpense)).rejects.toThrow(/Expense name must not be empty/);
		});

		test('throws validation error for negative price', async () => {
			const invalidExpense = generateExpenseFixture(1, 'Negative', -1);

			expect(() => tracker.addExpenses(invalidExpense)).rejects.toThrow(/Expense price must be greater than zero/);
		});
	});
});
