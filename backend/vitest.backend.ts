import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		exclude: ['**/node_modules/**', '**/dist/**', '**/frontend/**'],
		environment: 'node',
		reporters: ['verbose'],
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
