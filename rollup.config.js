
import rollup_cjs from '@rollup/plugin-commonjs';
import rollup_re from '@rollup/plugin-node-resolve';
import rollup_tsc from '@rollup/plugin-typescript';

// NOTE: multi-entry seems to fail with the new rollup 3.x (not really needed anyway)
// import rollup_multi from '@rollup/plugin-multi-entry';

// NOTE: For testing bundling size only. 
//       Standard 'tsc' is used for generating the /dist/ dir

export default [
	{
		input: './src/index.ts',
		output: {
			file: './.dist-lib/dom-native.js',
			format: 'iife',
			name: 'bundle',
			sourcemap: true
		},
		plugins: [
			// rollup_multi(),
			rollup_cjs(),
			rollup_re(),
			rollup_tsc({
				tsconfig: './tsconfig.json',
				compilerOptions: {
					declaration: false,
					declarationDir: null,
				}
			})
		]
	}
]

