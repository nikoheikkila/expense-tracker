import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { Expense } from '../../lib/interfaces';
import ExpenseTracker from '../src/services/expense_tracking';
import { Repository, RepositoryFactory } from '../src/services/repository';

const generateExpenseFixture = (name: string = 'Item', price: number = 100): Expense => {
	return {
		name,
		price,
		created: new Date(),
	};
};

describe('Expense Tracking', () => {
	let repository: Repository<Expense>;
	let tracker: ExpenseTracker;

	beforeEach(() => {
		vi.useFakeTimers();
	});

	beforeAll(() => {
		repository = RepositoryFactory.create();
		tracker = new ExpenseTracker(repository);
	});

	afterEach(async () => {
		await repository.clear();
		vi.useRealTimers();
	});

	describe('Adding expenses', () => {
		test('adds a single expense', async () => {
			const expense = generateExpenseFixture();

			const expenses = await tracker.addExpenses(expense);

			expect(expenses).toHaveLength(1);
			expect(expenses[0]).toMatchObject(expense);
		});

		test('adds multiple expenses', async () => {
			const expenses = [generateExpenseFixture(), generateExpenseFixture()];

			const filedExpenses = await tracker.addExpenses(...expenses);

			expect(filedExpenses).toHaveLength(2);
			expect(filedExpenses).toMatchObject(expenses);
		});

		test('throws error when adding empty expense', async () => {
			expect(() => tracker.addExpenses()).rejects.toThrow(/Input data must not be empty/);
		});
	});

	describe('Searching expenses', () => {
		test('finds expense by ID', async () => {
			const [first, second] = await repository.add(generateExpenseFixture('Lamp'), generateExpenseFixture('Couch'));

			const foundExpense = await tracker.searchById(1);

			expect(foundExpense).toMatchObject(first);
			expect(foundExpense).not.toMatchObject(second);
		});

		test('finds expense by matching the name', async () => {
			const expectedName = /Movie Ticket/;
			const [first, second] = await repository.add(generateExpenseFixture('Groceries'), generateExpenseFixture('Movie Tickets'));

			const [foundExpense] = await tracker.searchByQuery((expense) => expectedName.test(expense.name));

			expect(foundExpense).not.toMatchObject(first);
			expect(foundExpense).toMatchObject(second);
		});

		test('finds expenses by comparing the price range', async () => {
			const minimumPrice = 150;
			const maximumPrice = 250;
			await repository.add(
				generateExpenseFixture('Groceries', minimumPrice - 1),
				generateExpenseFixture('Groceries', minimumPrice),
				generateExpenseFixture('Groceries', maximumPrice),
				generateExpenseFixture('Groceries', maximumPrice + 1),
			);

			const foundExpenses = await tracker.searchByQuery((expense) => expense.price >= minimumPrice && expense.price <= maximumPrice);

			expect(foundExpenses).toHaveLength(2);
		});

		test('throws error when expense is not found by ID', async () => {
			expect(() => tracker.searchById(999)).rejects.toThrow(/Error: Expense with ID 999 doesn't exist/);
		});

		test('throws error when expense is not found by predicate', async () => {
			const query = (expense: Expense) => expense.name === 'Groceries' && expense.price === 500;
			await repository.add(generateExpenseFixture('Groceries', 499));

			expect(() => tracker.searchByQuery(query)).rejects.toThrow(/Expense not found with given query/);
		});
	});

	describe('Updating expenses', () => {
		test('updates an existing expense with new details', async () => {
			await repository.add(generateExpenseFixture('Old Name', 100));
			const newDetails = generateExpenseFixture('New Name', 200);

			const expense = await tracker.updateExpense(1, newDetails);

			expect(expense).toMatchObject(newDetails);
		});

		test('creates a new expense when updating a missing one', async () => {
			const newDetails = generateExpenseFixture('New Name', 200);

			const expense = await tracker.updateExpense(1, newDetails);

			expect(expense).toMatchObject(newDetails);
		});
	});

	describe('Deleting expenses', () => {
		test('deletes an existing expense', async () => {
			await repository.add(generateExpenseFixture(), generateExpenseFixture());

			await tracker.deleteExpenses(1);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(1);
		});

		test('deletes multiple existing expenses', async () => {
			await repository.add(generateExpenseFixture(), generateExpenseFixture());

			await tracker.deleteExpenses(1, 2);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(0);
		});
	});

	describe('Validating expense data', () => {
		test('throws validation error for empty name', async () => {
			const invalidExpense = generateExpenseFixture('');
			const expectedError = /Expense name must not be empty/;

			expect(() => tracker.addExpenses(invalidExpense)).rejects.toThrow(expectedError);
		});

		test('throws validation error for negative price', async () => {
			const invalidExpense = generateExpenseFixture('Negative', -1);
			const expectedError = /Expense price must be greater than zero/;

			expect(() => tracker.addExpenses(invalidExpense)).rejects.toThrow(expectedError);
		});

		test('throws combined validation error for multiple issues', async () => {
			const invalidExpense = generateExpenseFixture('', -1);
			const expectedErrors = 'Expense name must not be empty, Expense price must be greater than zero';

			expect(() => tracker.addExpenses(invalidExpense)).rejects.toThrow(expectedErrors);
		});
	});
});
