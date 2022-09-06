import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['backend/tests/unit/**/*.test.ts'],
		environment: 'node',
		silent: true,
		maxConcurrency: 10,
		cache: {
			dir: '/tmp/.vitest',
		},
		onConsoleLog(log, type) {
			return false;
		},
		env: {
			NODE_ENV: 'test',
		},
	},
});
