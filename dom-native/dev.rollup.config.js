import rollup_cjs from "@rollup/plugin-commonjs";
import rollup_re from "@rollup/plugin-node-resolve";
import rollup_tsc from "@rollup/plugin-typescript";

// NOTE: multi-entry seems to fail with the new rollup 3.x (not really needed anyway)
// import rollup_multi from '@rollup/plugin-multi-entry';

export default [
	//// test
	{
		input: "./test/src/index.ts",
		output: {
			file: "./test/dist/test-bundle.js",
			format: "iife",
			name: "test_bundle",
			sourcemap: true,
		},
		plugins: [
			// rollup_multi(),
			rollup_re(),
			rollup_tsc({
				tsconfig: "./test/tsconfig.json",
				include: ["./test/src/**/*.ts", "./src/**/*.ts"],
				declaration: false,
				declarationDir: null,
				compilerOptions: {
					outDir: "./test/dist/",
				},
			}),
			rollup_cjs(),
		],
	},
	//// demo
	{
		input: "./demo/src/index.ts",
		output: {
			file: "./demo/dist/demo-bundle.js",
			format: "iife",
			name: "bundle",
			sourcemap: true,
		},
		plugins: [
			rollup_re(),
			rollup_tsc({
				tsconfig: "./demo/tsconfig.json",
				include: ["demo/src/**/*.ts", "src/**/*.ts"],
				declaration: false,
				declarationDir: null,
				compilerOptions: {
					outDir: "./demo/dist/",
				},
			}),
			rollup_cjs(),
		],
	},
];
