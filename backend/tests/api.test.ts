import { asValue } from 'awilix';
import { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Expense } from '../../lib/interfaces';
import APIClient from '../src/api/client';
import { Repository } from '../src/services/repository';

describe('API Tests', () => {
	let app: FastifyInstance;

	beforeEach(async () => {
		app = APIClient();
		await app.ready();
	});

	afterEach(async () => {
		await app.close();
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
					id: 1,
					name: 'Groceries',
					price: 100,
				},
			]);
		});

		test('returns 201 for multiple expenses', async () => {
			const payload = [
				{
					name: 'Groceries',
					price: 100,
				},
				{
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
					id: 1,
					name: 'Groceries',
					price: 100,
				},
				{
					id: 2,
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
				expenseRepository: asValue(fakeRepository as unknown as Repository<Expense>),
			});

			const response = await app.inject({
				method: 'PUT',
				url: '/api/expenses/add',
				payload: [{ name: 'Groceries', price: 100 }],
			});

			expect(response.statusCode).toBe(500);
		});
	});

	describe('GET /api/expenses/list', () => {
		let repository: Repository<Expense>;

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
					name: 'Groceries',
					price: 100,
				},
				{
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
					id: 1,
					name: 'Groceries',
					price: 100,
				},
				{
					id: 2,
					name: 'Gas',
					price: 50,
				},
			]);
		});
	});

	describe('POST /api/expenses/search', () => {
		test('returns 200 for expense found with ID', async () => {
			const expense = {
				name: 'Groceries',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/search',
				payload: {
					key: 'id',
					operator: '==',
					value: 1,
				},
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject([
				{
					id: 1,
					name: 'Groceries',
					price: 100,
				},
			]);
		});

		test('returns 200 for expense found with name', async () => {
			const expense = {
				name: 'Groceries',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/search',
				payload: {
					key: 'name',
					operator: '==',
					value: 'Groceries',
				},
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject([
				{
					id: 1,
					name: 'Groceries',
					price: 100,
				},
			]);
		});

		test('returns 404 for expense not found with name', async () => {
			const expense = {
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
			const expense = {
				name: 'Groceries',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/update',
				payload: {
					id: 1,
					update: {
						name: 'Gas',
						price: 50,
					},
				},
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				id: 1,
				old: {
					name: 'Groceries',
					price: 100,
				},
				new: {
					name: 'Gas',
					price: 50,
				},
			});
		});

		test('returns 404 when updating a missing expense', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/update',
				payload: {
					id: 1,
					update: {
						name: 'Gas',
					},
				},
			});

			expect(response.statusCode).toBe(404);
			expect(response.json()).toMatchObject({
				error: 'Not Found: Expenses with IDs (1) do not exist',
			});
		});

		test('returns 400 when updating an expense with disallowed keys', async () => {
			const expense = {
				name: 'Gardening',
				price: 100,
			};

			await app.diContainer.resolve('expenseRepository').add(expense);

			const response = await app.inject({
				method: 'POST',
				url: '/api/expenses/update',
				payload: {
					id: 1,
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
					name: 'Groceries',
					price: 100,
				},
				{
					name: 'Gas',
					price: 50,
				},
			];

			await app.diContainer.resolve('expenseRepository').add(...expenses);

			const response = await app.inject({
				method: 'DELETE',
				url: '/api/expenses/delete',
				payload: {
					ids: [1, 2],
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
					ids: [1, 2, 3],
				},
			});

			expect(response.statusCode).toBe(404);
			expect(response.json()).toMatchObject({
				error: 'Not Found: Expenses with IDs (1, 2, 3) do not exist',
			});
		});
	});
});
