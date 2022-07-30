import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { Expense } from '../../lib/interfaces';
import { InMemoryRepository } from '../src/repository';
import ExpenseTracker from '../src/services/expense_tracking';

const generateExpenseFixture = (name: string = 'Item', price: number = 100): Expense => {
	return {
		name,
		price,
		created: new Date(),
	};
};

describe('Expense Tracking', () => {
	let repository: InMemoryRepository<Expense>;
	let tracker: ExpenseTracker;

	beforeAll(() => {
		repository = new InMemoryRepository();
		tracker = new ExpenseTracker(repository);
	});

	afterEach(() => {
		repository.clear();
	});

	describe('Adding expenses', () => {
		test('adds a single expense', async () => {
			const expense = generateExpenseFixture();

			await tracker.addExpenses(expense);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(1);
			expect(expenses[0]).toMatchObject(expense);
		});

		test('adds multiple expenses', async () => {
			const expenses = [generateExpenseFixture(), generateExpenseFixture()];

			await tracker.addExpenses(...expenses);
			const trackedExpenses = await tracker.getExpenses();

			expect(trackedExpenses).toMatchObject(expenses);
		});

		test('throws error when adding empty expense', async () => {
			expect(() => tracker.addExpenses()).rejects.toThrow(/Input data must not be empty/);
		});
	});

	describe('Searching expenses', () => {
		test('finds expense by ID', async () => {
			const [first, second] = [generateExpenseFixture('Lamp'), generateExpenseFixture('Couch')];

			await tracker.addExpenses(first, second);
			const foundExpense = await tracker.searchById(1);

			expect(foundExpense).toMatchObject(first);
			expect(foundExpense).not.toMatchObject(second);
		});

		test('finds expense by matching the name', async () => {
			const expectedName = /Movie Ticket/;
			const [first, second] = [generateExpenseFixture('Groceries'), generateExpenseFixture('Movie Tickets')];

			await tracker.addExpenses(first, second);
			const [foundExpense] = await tracker.searchByQuery((expense) => expectedName.test(expense.name));

			expect(foundExpense.name).toMatch(expectedName);
		});

		test('finds expenses by comparing the price range', async () => {
			const minimumPrice = 150;
			const maximumPrice = 250;
			const expenses = [
				generateExpenseFixture('Groceries', minimumPrice - 1),
				generateExpenseFixture('Groceries', minimumPrice),
				generateExpenseFixture('Groceries', maximumPrice),
				generateExpenseFixture('Groceries', maximumPrice + 1),
			];

			await tracker.addExpenses(...expenses);
			const foundExpenses = await tracker.searchByQuery((expense) => expense.price >= minimumPrice && expense.price <= maximumPrice);

			expect(foundExpenses).toHaveLength(2);
		});

		test('throws error when expense is not found by ID', async () => {
			expect(() => tracker.searchById(999)).rejects.toThrow(/Error: Expense with ID 999 doesn't exist/);
		});

		test('throws error when expense is not found by predicate', async () => {
			const query = (expense: Expense) => expense.name === 'Groceries' && expense.price === 500;

			tracker.addExpenses(generateExpenseFixture('Groceries', 499));

			expect(() => tracker.searchByQuery(query)).rejects.toThrow(/Expense not found with given query/);
		});
	});

	describe('Updating expenses', () => {
		test('updates an existing expense with new details', async () => {
			await tracker.addExpenses(generateExpenseFixture('Old Name', 100));
			const newDetails = generateExpenseFixture('New Name', 200);

			await tracker.updateExpense(1, newDetails);
			const [expense] = await tracker.getExpenses();

			expect(expense).toMatchObject(newDetails);
		});

		test('creates a new expense when updating a missing one', async () => {
			const newDetails = generateExpenseFixture('New Name', 200);

			await tracker.updateExpense(1, newDetails);
			const [expense] = await tracker.getExpenses();

			expect(expense).toMatchObject(newDetails);
		});
	});

	describe('Deleting a single expense', () => {
		test('deletes an existing expense', async () => {
			await tracker.addExpenses(generateExpenseFixture(), generateExpenseFixture());

			await tracker.deleteExpenses(1);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(1);
		});

		test('deletes multiple existing expenses', async () => {
			await tracker.addExpenses(generateExpenseFixture(), generateExpenseFixture());

			await tracker.deleteExpenses(1, 2);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(0);
		});
	});

	describe('Validating expense data', () => {
		test('throws validation error for empty name', async () => {
			const invalidExpense = generateExpenseFixture('');

			expect(() => tracker.addExpenses(invalidExpense)).rejects.toThrow(/Expense name must not be empty/);
		});

		test('throws validation error for negative price', async () => {
			const invalidExpense = generateExpenseFixture('Negative', -1);

			expect(() => tracker.addExpenses(invalidExpense)).rejects.toThrow(/Expense price must be greater than zero/);
		});
	});
});
