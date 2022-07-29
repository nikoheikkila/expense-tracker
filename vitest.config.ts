import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		reporters: ['verbose'],
		coverage: {
			enabled: true,
			src: ['backend/src/**/*.ts'],
			reporter: ['text', 'html'],
		},
		sequence: {
			shuffle: true,
		},
		cache: {
			dir: '/tmp/.vitest',
		},
		onConsoleLog(log, type) {
			return false;
		},
	},
});
