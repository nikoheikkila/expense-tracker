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
		repository = RepositoryFactory.create('memory');
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

		test('throws error when adding expense with zero ID', async () => {
			expect(tracker.addExpenses({ id: 0 } as Expense)).rejects.toThrow(
				/ID must be greater or equal to 1/,
			);
		});

		test('throws error when adding empty expense', async () => {
			expect(tracker.addExpenses()).rejects.toThrow(/Input data must not be empty/);
		});

		test('throws error when adding expense without name', async () => {
			const withoutName = generateExpenseFixture('', 1);
			expect(tracker.addExpenses(withoutName)).rejects.toThrow(
				/Expense name must not be empty/,
			);
		});

		test('throws error when adding expense with negative price', async () => {
			const negativePrice = generateExpenseFixture('Item', -1);
			expect(tracker.addExpenses(negativePrice)).rejects.toThrow(
				/Expense price must be greater than zero/,
			);
		});
	});

	describe('Searching expenses', () => {
		test('finds expense by ID', async () => {
			const [first, second] = await repository.add(
				generateExpenseFixture('Lamp'),
				generateExpenseFixture('Couch'),
			);

			const [firstFound] = await tracker.searchById([1]);

			expect(firstFound).toMatchObject(first);
			expect(firstFound).not.toMatchObject(second);
		});

		test('finds expense by matching the name', async () => {
			const expectedName = 'Movie Ticket';
			const [first, second] = await repository.add(
				generateExpenseFixture('Groceries'),
				generateExpenseFixture(expectedName),
			);

			const [foundExpense] = await tracker.searchByQuery('name', '===', expectedName);

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

			const moreExpensiveThanMinimum = await tracker.searchByQuery(
				'price',
				'>=',
				minimumPrice,
			);
			const cheaperThanMaximum = await tracker.searchByQuery('price', '<=', maximumPrice);

			expect(moreExpensiveThanMinimum).toHaveLength(3);
			expect(cheaperThanMaximum).toHaveLength(3);
		});

		test('throws error when expense is not found by ID', async () => {
			expect(tracker.searchById([999])).rejects.toThrow(
				/Expenses with IDs \(999\) do not exist/,
			);
		});

		test('throws error when expense is not found by query', async () => {
			await repository.add(generateExpenseFixture('Groceries', 499));

			expect(tracker.searchByQuery('price', '==', 500)).rejects.toThrow(
				/Expense not found with given query: price==500/,
			);
		});

		test('throws error with missing query key', async () => {
			expect(tracker.searchByQuery('', '==', 1)).rejects.toThrow(
				/Query key must not be empty/,
			);
		});

		test('throws error with missing query operator', async () => {
			const operator = '' as Operator;

			expect(tracker.searchByQuery('id', operator, 1)).rejects.toThrow(
				/Query operator must not be empty/,
			);
		});

		test('throws error with invalid query operator', async () => {
			const operator = '!!' as Operator;
			const errorPattern = /Query operator must match regular expression: (.+)/;

			expect(tracker.searchByQuery('id', operator, 1)).rejects.toThrow(errorPattern);
		});
	});

	describe('Updating expenses', () => {
		test('updates an existing expense with new details', async () => {
			await repository.add(generateExpenseFixture('Old Name', 100));
			const newDetails = generateExpenseFixture('New Name', 200);

			const expense = await tracker.updateExpense(1, newDetails);

			expect(expense).toMatchObject(newDetails);
		});

		test('throws error when updating a missing expense', async () => {
			const newDetails = generateExpenseFixture('New Name', 200);

			expect(tracker.updateExpense(1, newDetails)).rejects.toThrow(
				'Expenses with IDs (1) do not exist',
			);
		});

		test('throws error when updating expense with empty data', async () => {
			await repository.add(generateExpenseFixture('Old Name', 100));

			expect(tracker.updateExpense(1, {} as Expense)).rejects.toThrow(
				/Specify one or more allowed key-value pairs to update the expense/,
			);
		});

		test('throws error when updating expense with disallowed keys', async () => {
			await repository.add(generateExpenseFixture('Old Name', 100));

			const bogusData = { key1: 'bogus', key2: 'bogus' } as any as Expense;

			expect(tracker.updateExpense(1, bogusData)).rejects.toThrow(
				'Unrecognized key-value pairs (key1, key2) used to update the expense',
			);
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

			expect(tracker.addExpenses(invalidExpense)).rejects.toThrow(expectedError);
		});

		test('throws validation error for negative price', async () => {
			const invalidExpense = generateExpenseFixture('Negative', -1);
			const expectedError = /Expense price must be greater than zero/;

			expect(tracker.addExpenses(invalidExpense)).rejects.toThrow(expectedError);
		});
	});
});
