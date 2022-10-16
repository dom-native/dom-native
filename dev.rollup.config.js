
import rollup_cjs from '@rollup/plugin-commonjs';
import rollup_re from '@rollup/plugin-node-resolve';
import rollup_ts from 'rollup-plugin-typescript2';

// NOTE: multi-entry seems to fail with the new rollup 3.x (not really needed anyway)
// import rollup_multi from '@rollup/plugin-multi-entry';

// NOTE - For now, still using the 'rollup-plugin-typescript2' rather
//        than the official @rollup/plugin-typescript because somehow 
//        can't compile the typescript. Give typescript not valid js file, 
//        which shows that somehow @rollup/plugin-typescript get confused. 
//        Interesting, the source rollup.config.js works with @rollup/plugin-typescript
//        So, leaving like that for now, until we find why we have this issue.

export default [
	//// test
	{
		input: './test/src/index.ts',
		output: {
			file: './test/dist/test-bundle.js',
			format: 'iife',
			name: 'test_bundle',
			sourcemap: true
		},
		plugins: [
			// rollup_multi(),
			rollup_cjs(),
			rollup_re(),
			rollup_ts({
				tsconfig: './test/tsconfig.json'
			})]
	},
	//// demo 
	{
		input: './demo/src/index.ts',
		output: {
			file: './demo/dist/demo-bundle.js',
			format: 'iife',
			name: 'bundle',
			sourcemap: true
		},
		plugins: [
			rollup_cjs(),
			rollup_re(),
			rollup_ts({
				tsconfig: './demo/tsconfig.json'
			})]
	}
]

