import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/*.{test,spec}.{ts,mts,cts,tsx}'],
		environment: 'node',
		reporters: ['verbose'],
		coverage: {
			enabled: true,
			src: ['backend/src/**/*.ts'],
			reporter: ['html'],
		},
		sequence: {
			shuffle: true,
		},
		cache: {
			dir: '/tmp/.vitest',
		},
		env: {
			NODE_ENV: 'test',
		},
	},
});
