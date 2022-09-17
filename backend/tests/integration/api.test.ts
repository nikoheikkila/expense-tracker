import { nanoid } from 'nanoid';
import { asValue } from 'awilix';
import { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import Expense from '@backend/domain/entities/Expense';
import AppDataSource from '@backend/config';
import APIClient from '@backend/api/client';
import { IRepository } from '@backend/services/repository';

describe('API Tests', () => {
	let app: FastifyInstance;

	beforeEach(async () => {
		await AppDataSource.initialize();
		app = APIClient();
		await app.ready();
	});

	afterEach(async () => {
		await app.close();
		await AppDataSource.synchronize(true);
		await AppDataSource.destroy();
	});

	describe('GET /health', () => {
		test('returns 200 for healthy system', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/health',
			});

			expect(response.statusCode).toBe(200);
		});
	});

	describe('PUT /api/expenses/add', () => {
		test('return 201 for single expense', async () => {
			const payload = [
				{
					id: nanoid(),
					name: 'Groceries',
					price: 100,
				},
			];
			const response = await app.inject({
				method: 'PUT',
				url: '/api/expenses/add',
				payload,
			});

			expect(response.statusCode).toBe(201);
			expect(response.json()).toMatchObject([
				{
					name: 'Groceries',
					price: 100,
				},
			]);
		});

		test('returns 201 for multiple expenses', async () => {
			const payload = [
				{
					id: nanoid(),
					name: 'Groceries',
					price: 100,
				},
				{
					id: nanoid(),
					name: 'Gas',
					price: 50,
				},
			];
			const response = await app.inject({
				method: 'PUT',
				url: '/api/expenses/add',
				payload,
			});

			expect(response.statusCode).toBe(201);
			expect(response.json()).toMatchObject([
				{
					name: 'Groceries',
					price: 100,
				},
				{
					name: 'Gas',
					price: 50,
				},
			]);
		});

		test('returns 400 for invalid request', async () => {
			const response = await app.inject({
				method: 'PUT',
				url: '/api/expenses/add',
				payload: [],
			});

			expect(response.statusCode).toBe(400);
		});

		test('returns 500 for invalid request', async () => {
			const expectedError = 'Unable to connect to database';
			const fakeRepository = {
				add: async () => {
					throw new Error(expectedError);
				},
			};
			app.diContainer.register({
				expenseRepository: asValue(fakeRepository as unknown as IRepository<Expense>),
			});

			const response = await app.inject({
				method: 'PUT',
				url: '/api/expenses/add',
				payload: [{ id: nanoid(), name: 'Groceries', price: 100 }],
			});

			expect(response.statusCode).toBe(500);
		});
	});

	describe('GET /api/expenses/list', () => {
		let repository: IRepository<Expense>;

		beforeEach(() => {
			repository = app.diContainer.resolve('expenseRepository');
		});

		test('returns 200 for empty list', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/expenses/list',
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject([]);
		});

		test('returns 200 with expenses', async () => {
			const payload = [
				{
					id: nanoid(),
					name: 'Groceries',
					price: 100,
				},
				{
					id: nanoid(),
					name: 'Gas',
					price: 50,
				},
			];
			await repository.add(...payload);
			const response = await app.inject({
				method: 'GET',
				url: '/api/expenses/list',
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject([
				{
					name: 'Groceries',
					price: 100,
				},
				{
					name: 'Gas',
					price: 50,
				},
			]);
		});
	});

	describe('POST /api/expenses/search', () => {
		test('returns 200 for expense found with ID', async () => {
			const expense = {
				id: nanoid(),
				name: 'Groceries',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/search',
				payload: {
					key: 'id',
					operator: '=',
					value: expense.id,
				},
			});

			expect(response.json()).toMatchObject([
				{
					name: 'Groceries',
					price: 100,
				},
			]);
			expect(response.statusCode).toBe(200);
		});

		test('returns 200 for expense found with name', async () => {
			const expense = {
				id: nanoid(),
				name: 'Groceries',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/search',
				payload: {
					key: 'name',
					operator: '=',
					value: 'Groceries',
				},
			});

			expect(response.json()).toMatchObject([
				{
					name: 'Groceries',
					price: 100,
				},
			]);
			expect(response.statusCode).toBe(200);
		});

		test('returns 404 for expense not found with name', async () => {
			const expense = {
				id: nanoid(),
				name: 'Groceries',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/search',
				payload: {
					key: 'name',
					operator: '!=',
					value: 'Groceries',
				},
			});

			expect(response.statusCode).toBe(404);
			expect(response.json()).toMatchObject({
				error: 'Not Found: Expense not found with given query: name!=Groceries',
			});
		});

		test('returns 400 for missing query parameters', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/search',
				payload: {},
			});

			expect(response.statusCode).toBe(400);
		});
	});

	describe('POST /api/expenses/update', () => {
		test('returns 200 for updated expense', async () => {
			const id = nanoid();

			const expense = {
				id,
				name: 'Groceries',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/update',
				payload: {
					id,
					update: {
						name: 'Gas',
						price: 50,
					},
				},
			});

			expect(response.json()).toMatchObject({
				id,
				old: {
					id,
					name: 'Groceries',
					price: 100,
				},
				new: {
					id,
					name: 'Gas',
					price: 50,
				},
			});
			expect(response.statusCode).toBe(200);
		});

		test('returns 404 when updating a missing expense', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/update',
				payload: {
					id: nanoid(),
					update: {
						name: 'Gas',
					},
				},
			});

			expect(response.statusCode).toBe(404);
			expect(response.json()).toMatchObject({
				error: /Not Found: Expenses with IDs (.+) do not exist/,
			});
		});

		test('returns 400 when updating an expense with disallowed keys', async () => {
			const id = nanoid();

			const expense = {
				id,
				name: 'Gardening',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/update',
				payload: {
					id,
					update: {
						vatPrice: 24,
					},
				},
			});

			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				error: 'Bad Request: Unrecognized key-value pairs (vatPrice) used to update the expense',
			});
		});
	});

	describe('DELETE /api/expenses/delete', () => {
		test('returns 204 without content for deleted expenses', async () => {
			const expenses = [
				{
					id: nanoid(),
					name: 'Groceries',
					price: 100,
				},
				{
					id: nanoid(),
					name: 'Gas',
					price: 50,
				},
			];

			await app.diContainer.resolve('expenseRepository').add(...expenses);

			const response = await app.inject({
				method: 'DELETE',
				url: '/api/expenses/delete',
				payload: {
					ids: [expenses[0].id, expenses[1].id],
				},
			});

			expect(response.statusCode).toBe(204);
			expect(response.body).toBe('');
		});

		test('returns 400 for empty list of expense IDs', async () => {
			const response = await app.inject({
				method: 'DELETE',
				url: '/api/expenses/delete',
				payload: {
					ids: [],
				},
			});

			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				error: 'Bad Request: List of expense IDs to delete cannot be empty',
			});
		});

		test('returns 400 when attempting to delete missing expenses', async () => {
			const response = await app.inject({
				method: 'DELETE',
				url: '/api/expenses/delete',
				payload: {
					ids: ['1', '2', '3'],
				},
			});

			expect(response.statusCode).toBe(404);
			expect(response.json()).toMatchObject({
				error: 'Not Found: Expenses with IDs (1, 2, 3) do not exist',
			});
		});
	});
});
