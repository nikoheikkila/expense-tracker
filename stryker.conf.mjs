// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
	mutate: ["backend/src/{domain,services}/**/*.ts", "lib/**/*.ts"],
	tsconfigFile: "tsconfig.json",
	packageManager: "yarn",
	reporters: ["html", "clear-text", "progress"],
	testRunner: "command",
	timeoutFactor: 3,
	commandRunner: {
		command: "npx vitest run -c backend/vitest.backend.ts --dir backend/tests/unit",
	},
};
export default config;
