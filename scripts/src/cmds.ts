import { router } from 'cmdrouter';
import { readFile, saferRemove, stat, writeFile } from 'fs-extra-plus';
import * as Path from 'path';
import * as rollup from 'rollup';
import * as Terser from 'terser';
import { now } from './utils';
import rollup_cjs = require('rollup-plugin-commonjs');
import rollup_re = require('rollup-plugin-node-resolve');
import rollup_ts = require('rollup-plugin-typescript2');


const DIST_FILE = './test/dist/dom-native.js';
const DIST_MIN_FILE = './test/dist/dom-native.min.js';
const defaultOpts: RollupFilesOptions = {
	ts: true,
	watch: false
};

router({ build, watch }).route();

async function build() {
	await _buildSrc();

	// print the file size
	const content = await readFile(DIST_FILE, "utf8");
	const minContent = Terser.minify(content);
	await writeFile(DIST_MIN_FILE, minContent.code, "utf8");
	const file_size = (await stat(DIST_FILE)).size;
	const file_min_size = (await stat(DIST_MIN_FILE)).size;
	console.log(`${DIST_FILE} - ${file_size / 1000}K`);
	console.log(`${DIST_MIN_FILE} - ${file_min_size / 1000}K`);
	// await _buildTest();
}

async function watch() {
	await _buildSrc(true);
	await _buildTest(true);
}

async function _buildSrc(watch = false) {
	const opts = {
		ts: true,
		watch
	}
	await rollupFiles(['src/index.ts'], DIST_FILE, opts);
}


async function _buildTest(watch = false) {
	const opts = {
		ts: true,
		watch
	}
	const distFile = './test/dist/test-bundle.js';
	await rollupFiles(['test/src/index.ts'], distFile, opts);
	console.log('done');
}

//#region    ---------- Rollup Processor ---------- 
interface RollupFilesOptions {
	ts?: boolean;
	/* {importName: globalName} - (default undefined) define the list of global names (assumed to be mapped to window._name_) */
	globals?: { [importName: string]: string };
	watch: boolean;
	tsconfig?: string;
}



/**
 * @param {*} opts 
 *    - ts?: boolean - (default true)
 *    - 
 *    - watch: true | false (default false)
 */
export async function rollupFiles(entries: string[], distFile: string, opts: RollupFilesOptions) {
	opts = Object.assign({}, defaultOpts, opts);

	await saferRemove("./.rpt2_cache");

	// delete the previous ouutput files
	const mapFile = distFile + ".map";
	try {
		// Note: Do not delete the distFile if we are in watch mode, otherwise, rollup throw an uncatched promise exception
		if (!opts.watch) {
			await saferRemove(distFile);
		}
		await saferRemove(mapFile);
	} catch (ex) {
		console.log(`Can't delete dist files`, ex);
	}

	// set the default rollup input options
	const inputOptions: any = {
		input: entries,
		plugins: [rollup_cjs(), rollup_re()]
	};


	// set the default rollup output options
	// make the name from file name "web/js/lib-bundle.js" : "lib_bundle"
	const name = Path.parse(distFile).name.replace(/\W+/g, "_");
	const outputOptions: any = {
		file: distFile,
		format: 'iife',
		name: name,
		sourcemap: true,
		sourcemapFile: mapFile
	};

	// if ts, then, we add the rollup_ts plugin
	if (opts.ts || opts.tsconfig) {
		let tsOpts: any = {
			clean: true
		};
		if (opts.tsconfig) {
			tsOpts.tsconfig = opts.tsconfig;
		}
		// Note: if we do not have clean:true, we get some exception when watch.
		inputOptions.plugins.push(rollup_ts(tsOpts));
	}

	// if we have some globals, we add them accordingly
	if (opts.globals) {
		// for input, just set the external (clone to be safe(r))
		inputOptions.external = Object.keys(opts.globals);
		outputOptions.globals = opts.globals;
	}

	try {
		// if it is watch mode, we do the watch
		if (opts.watch) {
			//wathOptions = { inputOptions };
			let watchOptions = { ...inputOptions };
			watchOptions.output = outputOptions;
			watchOptions.watch = { chokidar: true };

			const watcher = rollup.watch(watchOptions);
			let startTime: number;

			watcher.on('event', function (evt) {
				// console.log('rollup watch', evt.code, evt.output);
				if (evt.code === 'START') {
					startTime = now();
				} else if (evt.code === 'END') {
					console.log(`Recompile ${distFile} done: ${Math.round(now() - startTime)}ms`);
				} else if (evt.code === 'ERROR') {
					console.log(`ERROR - Rollup/Typescript error when processing: ${distFile}`);
					console.log("\t" + evt.error);
				}
			});
		}
		// otherwise, we do the full build
		else {
			// bundle
			const bundle = await rollup.rollup(inputOptions);

			// write
			await bundle.write(outputOptions);
		}


		// make sure the .rpt2_cache/ folder is delete (apparently, clean:true does not work)
		//await fs.remove("./.rpt2_cache");
	} catch (ex) {
		// make sure we write nothing in the file, to know nothing got compiled and fail early
		await writeFile(distFile, "", "utf8");
		throw ex;
	}
}
//#endregion ---------- /Rollup Processor ----------
