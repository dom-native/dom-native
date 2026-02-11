
import { router } from 'cmdrouter';
import { execa } from 'execa';
import { saferRemove } from 'fs-aux';
import { readFile, stat, writeFile } from 'fs/promises';
import * as Terser from 'terser';
import { wait } from 'utils-min';
import { buildDemoCode } from './helpers.js';

const DIST_FILE = './.dist-lib/dom-native.js';
const DIST_MIN_FILE = './.dist-lib/dom-native.min.js';

const { stdout, stderr } = process;

router({ build, build_lib, watch }).route();

async function build() {
	await saferRemove('./dist');
	await execa('./node_modules/.bin/tsc', { stdout, stderr });
}

async function build_lib() {
	await saferRemove('./.dist-lib');
	await execa('./node_modules/.bin/rollup', ['-c'], { stdout, stderr });
	await min();
}

async function min() {
	// print the file size
	const content = await readFile(DIST_FILE, "utf8");
	const minContent = await Terser.minify(content);
	await writeFile(DIST_MIN_FILE, minContent.code!, "utf8");
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
	execa('npm', ['run', 'build-dev-js', '--', '-w'], { stdout, stderr });
	execa('npm', ['run', 'build-dev-css', '--', '-w', '--verbose'], { stdout, stderr });

	// 'webdev' bust have the 'test/dist/test-bundle.js' exists (because of notify)
	// to be able to start so, needs to wait.
	await wait(3000);

	// requires webdev server 
	// cargo install webdev (to install it)
	execa('webdev', ["-l", "-p", "8888", "-d", "./", "-w", "test/common", "-w", "test/dist/test-bundle.js"], { stdout, stderr });

	buildDemoCode(true);
}