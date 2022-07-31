import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import APIClient from '../src/api/client';

describe('API Tests', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		app = APIClient();
		await app.ready();
	});

	afterAll(() => app.close());

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
			const repository = app.diContainer.resolve('expenseRepository');

			const payload = [
				{
					name: 'Groceries',
					price: 100,
				},
			];
			await repository.add(...payload);
			const response = await app.inject({
				method: 'PUT',
				url: '/api/expenses/add',
				payload,
			});

			expect(response.statusCode).toBe(201);
			expect(response.json()).toMatchObject(
				payload.map((expense, index) => {
					return {
						...expense,
						id: index + 1,
						created: expect.any(String),
					};
				}),
			);
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
			expect(response.json()).toMatchObject(
				payload.map((expense, index) => {
					return {
						...expense,
						id: index + 1,
						created: expect.any(String),
					};
				}),
			);
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
	});
});
