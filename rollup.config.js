
import rollup_cjs from '@rollup/plugin-commonjs';
import rollup_multi from '@rollup/plugin-multi-entry';
import rollup_re from '@rollup/plugin-node-resolve';
import rollup_ts from 'rollup-plugin-typescript2';

// NOTE: For testing bundling size only. 
//       Standard 'tsc' is used for generating the /dist/ dir

export default [
	{
		input: './src/index.ts',
		output: {
			file: './.dist-lib/dom-native.js',
			format: 'iife',
			name: 'bundle'
		},
		plugins: [
			rollup_multi(),
			rollup_cjs(),
			rollup_re(),
			rollup_ts({
				verbosity: 1,
				tsconfig: './tsconfig.json',
				tsconfigOverride: {
					compilerOptions: {
						declaration: false,
						declarationDir: null,
					},
				},
				useTsconfigDeclarationDir: false
			})]
	}
]

