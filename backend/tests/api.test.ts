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
		test('returns 200 OK', async () => {
			const app = APIClient();

			const response = await app.inject({
				method: 'GET',
				url: '/health',
			});

			expect(response.statusCode).toBe(200);
		});
	});
});
