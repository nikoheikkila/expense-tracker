import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/*.{test,spec}.{ts,mts,cts,tsx}'],
		environment: 'node',
		silent: true,
		cache: {
			dir: '/tmp/.vitest',
		},
		onConsoleLog(log, type) {
			return false;
		},
	},
});
