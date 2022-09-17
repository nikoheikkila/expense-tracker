import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		exclude: ['**/node_modules/**', '**/dist/**'],
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
