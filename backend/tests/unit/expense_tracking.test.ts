import { nanoid } from 'nanoid';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { Operator } from '../../../lib/interfaces';
import Expense from '../../src/domain/entities/Expense';
import ExpenseTracker from '../../src/services/expense_tracking';
import { InMemoryRepository, ExpenseRepositoryFactory } from '../../src/services/repository';

const generateExpenseFixture = (name: string = 'Item', price: number = 100): Expense => {
	return Expense.make({ id: nanoid(), name, price });
};

describe('Expense Tracking', () => {
	let repository: InMemoryRepository<Expense>;
	let tracker: ExpenseTracker;

	beforeEach(() => {
		vi.useFakeTimers();
	});

	beforeAll(() => {
		repository = ExpenseRepositoryFactory.withInMemoryDatabase();
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
			expect(tracker.addExpenses()).rejects.toThrow(
				/List of expenses to add cannot be empty/,
			);
		});
	});

	describe('Searching expenses', () => {
		test('finds expense by ID', async () => {
			const [first, second] = await repository.add(
				generateExpenseFixture('Lamp'),
				generateExpenseFixture('Couch'),
			);

			const [firstFound] = await tracker.searchById([first.id]);

			expect(firstFound).toMatchObject(first);
			expect(firstFound).not.toMatchObject(second);
		});

		test('finds expense by matching the name', async () => {
			const expectedName = 'Movie Ticket';
			const [first, second] = await repository.add(
				generateExpenseFixture('Groceries'),
				generateExpenseFixture(expectedName),
			);

			const [foundExpense] = await tracker.searchByQuery(
				'name',
				Operator.EQUAL,
				expectedName,
			);

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
				Operator.GREATER_OR_EQUAL,
				minimumPrice,
			);
			const cheaperThanMaximum = await tracker.searchByQuery(
				'price',
				Operator.LESS_OR_EQUAL,
				maximumPrice,
			);

			expect(moreExpensiveThanMinimum).toHaveLength(3);
			expect(cheaperThanMaximum).toHaveLength(3);
		});

		test('throws error when expense is not found by ID', async () => {
			const firstId = nanoid();
			const secondId = nanoid();
			const expectedError = `Expenses with IDs (${firstId}, ${secondId}) do not exist`;

			expect(tracker.searchById([firstId, secondId])).rejects.toThrowError(expectedError);
		});

		test('throws error when expense is not found by query', async () => {
			await repository.add(generateExpenseFixture('Groceries', 499));

			expect(tracker.searchByQuery('price', Operator.EQUAL, 500)).rejects.toThrow(
				/Expense not found with given query: price=500/,
			);
		});

		test('throws error with missing query key', async () => {
			expect(tracker.searchByQuery('', Operator.EQUAL, 1)).rejects.toThrow(
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
			const [first] = await repository.add(generateExpenseFixture('Old Name', 100));
			const newDetails = generateExpenseFixture('New Name', 200);

			const expense = await tracker.updateExpense(first.id, newDetails);

			expect(expense).toMatchObject(newDetails);
		});

		test('throws error when updating a missing expense', async () => {
			const newDetails = generateExpenseFixture('New Name', 200);

			expect(tracker.updateExpense(nanoid(), newDetails)).rejects.toThrow(
				/Expenses with IDs (.+) do not exist/,
			);
		});

		test('throws error when updating expense with empty data', async () => {
			const [expense] = await repository.add(generateExpenseFixture('Old Name', 100));

			expect(tracker.updateExpense(expense.id, {} as Expense)).rejects.toThrow(
				/Specify one or more allowed key-value pairs to update the expense/,
			);
		});

		test('throws error when updating expense with disallowed keys', async () => {
			const [expense] = await repository.add(generateExpenseFixture('Old Name', 100));

			const bogusData = { key1: 'bogus', key2: 'bogus' } as any as Expense;

			expect(tracker.updateExpense(expense.id, bogusData)).rejects.toThrow(
				'Unrecognized key-value pairs (key1, key2) used to update the expense',
			);
		});
	});

	describe('Deleting expenses', () => {
		test('deletes an existing expense', async () => {
			const [expense1, expense2] = await repository.add(
				generateExpenseFixture(),
				generateExpenseFixture(),
			);

			await tracker.deleteExpenses(expense1.id);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(1);
		});

		test('deletes multiple existing expenses', async () => {
			const [expense1, expense2] = await repository.add(
				generateExpenseFixture(),
				generateExpenseFixture(),
			);

			await tracker.deleteExpenses(expense1.id, expense2.id);
			const expenses = await tracker.getExpenses();

			expect(expenses).toHaveLength(0);
		});

		test('throws error when deleting a missing expense', async () => {
			expect(tracker.deleteExpenses()).rejects.toThrow(
				'List of expense IDs to delete cannot be empty',
			);
		});
	});

	describe('Validating expense data', () => {
		test('throws validation error for invalid ID', async () => {
			expect(() => Expense.make({ id: 'null' })).toThrowError(
				/Expense ID must match regular expression/,
			);
		});

		test('throws validation error for empty name', async () => {
			expect(() => generateExpenseFixture('')).toThrowError(/Expense name must not be empty/);
		});

		test('throws validation error for negative price', async () => {
			expect(() => generateExpenseFixture('Negative', -1)).toThrowError(
				/Expense price must be greater than zero/,
			);
		});
	});
});
