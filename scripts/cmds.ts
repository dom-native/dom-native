
import { router } from 'cmdrouter';
import { readFile, readJSON, saferRemove, stat, writeFile } from 'fs-extra-plus';
import { spawn } from 'p-spawn';
import * as Terser from 'terser';
import { buildDemoCode, uploadSite } from './helpers';

const DIST_FILE = './.dist-lib/dom-native.js';
const DIST_MIN_FILE = './.dist-lib/dom-native.min.js';

router({ build, build_lib, watch, site, cdn }).route();

async function build() {
	await saferRemove('./dist');
	await spawn('./node_modules/.bin/tsc');
}

async function build_lib() {
	await saferRemove('./.dist-lib');
	await spawn('./node_modules/.bin/rollup', ['-c']);
	await min();
}

async function min() {
	// print the file size
	const content = await readFile(DIST_FILE, "utf8");
	const minContent = await Terser.minify(content);
	await writeFile(DIST_MIN_FILE, minContent.code, "utf8");
	const file_size = (await stat(DIST_FILE)).size;
	const file_min_size = (await stat(DIST_MIN_FILE)).size;
	console.log(`${DIST_FILE} - ${file_size / 1000}K`);
	console.log(`${DIST_MIN_FILE} - ${file_min_size / 1000}K`);
}

async function watch() {
	await saferRemove('./demo/dist');
	await saferRemove('./test/dist');

	// generate first to have the ts able to compile
	await buildDemoCode(false);
	spawn('npm', ['run', 'build-dev-js', '--', '-w']);
	spawn('npm', ['run', 'build-dev-css', '--', '-w', '--verbose']);

	buildDemoCode(true);
}


async function site() {
	uploadSite('demo/', 'dom-native/demo/core/')
}

async function cdn() {
	const pkg = await readJSON('./package.json');
	const version = pkg.version;

	await build_lib();

	await uploadSite('.dist-lib/dom-native.js', `dom-native/demo/dom-native-${version}.js`);
	await uploadSite('.dist-lib/dom-native.min.js', `dom-native/demo/dom-native-${version}.min.js`);


}
