import rollup_cjs = require('rollup-plugin-commonjs');
import rollup_re = require('rollup-plugin-node-resolve');
import rollup_ts = require('rollup-plugin-typescript2');
import rollup_alias from '@rollup/plugin-alias';
import rollup_multi from '@rollup/plugin-multi-entry';
import { mkdirs, readFile, saferRemove, writeFile } from 'fs-extra-plus';
import * as Path from 'path';
import postcss from 'postcss';
import * as rollup from 'rollup';
import debounce = require('lodash.debounce');

const pcss_processors = [
	require("autoprefixer"),
	require("postcss-import"),
	require("postcss-mixins"),
	require("postcss-nested")
];

//#region    ---------- Rollup Processor ---------- 
const defaultOpts: RollupFilesOptions = {
	ts: true,
	watch: false
};

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

	await mkdirs(Path.dirname(distFile));

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
		plugins: [rollup_multi(), rollup_cjs(), rollup_re(),
		rollup_alias({
			entries: [
				{ find: 'dom-native', replacement: './dist/index.js' }
			]
		})
		]
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
					startTime = Date.now();
				} else if (evt.code === 'END') {
					console.log(`Recompile ${distFile} done: ${Math.round(Date.now() - startTime)}ms`);
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


// --------- For postCss --------- //
export async function pcssFiles(entries: string[], distFile: string) {
	await mkdirs(Path.dirname(distFile));

	const mapFile = distFile + ".map";
	let pcssResult: any;
	try {

		await saferRemove([distFile, mapFile]);

		const processor = postcss(pcss_processors);
		const pcssNodes = [];

		// we parse all of the .pcss files
		for (let srcFile of entries) {
			// read the file
			let pcss = await readFile(srcFile, "utf8");

			const pcssNode = postcss.parse(pcss, {
				from: srcFile
			});
			pcssNodes.push(pcssNode);

		}

		// build build the combined rootNode and its result
		let rootNode = null;
		for (let pcssNode of pcssNodes) {
			rootNode = (rootNode) ? rootNode.append(pcssNode) : pcssNode;
		}
		const rootNodeResult = rootNode!.toResult();

		// we process the rootNodeResult
		pcssResult = await processor.process(rootNodeResult, {
			from: "undefined",
			to: distFile,
			map: { inline: false }
		});
	} catch (ex) {
		console.log(`postcss ERROR - Cannot process ${distFile} because (setting css empty file) \n${ex}`);
		// we write the .css and .map files
		await writeFile(distFile, "", "utf8");
		await writeFile(mapFile, "", "utf8");
		return;
	}

	// we write the .css and .map files
	console.log(`pcss done - ${distFile}`);
	await writeFile(distFile, pcssResult.css, "utf8");
	await writeFile(mapFile, pcssResult.map.toString(), "utf8");
}
// --------- /For postCss --------- //