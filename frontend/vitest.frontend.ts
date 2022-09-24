import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		setupFiles: ['tests/setup.ts'],
		exclude: ['**/node_modules/**', '**/dist/**'],
		environment: 'jsdom',
		reporters: ['verbose'],
		sequence: {
			shuffle: true,
		},
		cache: {
			dir: '/tmp/.vitest',
		},
	},
});
