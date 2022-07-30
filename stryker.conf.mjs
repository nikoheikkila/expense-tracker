// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
	mutate: ['backend/src/services/**/*.ts', 'lib/**/*.ts'],
	checkers: ['typescript'],
	tsconfigFile: 'tsconfig.json',
	packageManager: 'yarn',
	reporters: ['html', 'clear-text', 'progress'],
	testRunner: 'command',
	timeoutFactor: 3,
	commandRunner: {
		command: 'npx vitest --silent --run',
	},
	coverageAnalysis: 'perTest',
};
export default config;
