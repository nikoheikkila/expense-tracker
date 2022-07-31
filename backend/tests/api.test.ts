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
			expect(response.json()).toMatchObject({
				error: 'Bad Request: Input data must not be empty',
			});
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
			expect(response.json()).toMatchObject({
				error: `Internal Server Error: ${expectedError}`,
			});
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
});
