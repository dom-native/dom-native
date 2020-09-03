import chokidar from 'chokidar';
import { router } from 'cmdrouter';
import { glob, readFile, saferRemove, stat, writeFile } from 'fs-extra-plus';
import Terser from 'terser';
import { pcssFiles, rollupFiles } from './processors';
import debounce = require('lodash.debounce');


const DIST_FILE = './test/dist/dom-native.js';
const DIST_MIN_FILE = './test/dist/dom-native.min.js';

router({ build, watch }).route();

async function build() {
	await _buildTest();
	await _buildDemo();


	await _buildSrc();

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
	await _buildSrc(true);
	await _buildTest(true);
	await _buildDemo(true);
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

async function _buildDemo(watch = false) {
	await _generateDemoCodesFile();

	await saferRemove('./demo/dist');
	const opts = {
		ts: true,
		watch
	}
	const distFile = './demo/dist/demo-bundle.js';
	const files = await glob('demo/src/*.*');
	await rollupFiles(files, distFile, opts);

	async function pcssProcess() {
		// todo need to watch the files
		await pcssFiles(['demo/pcss/main.pcss'], './demo/dist/css/demo.css');
	}

	// do it first
	pcssProcess();

	if (watch) {
		const pcssWatcher = chokidar.watch('demo/pcss/*.pcss', { depth: 99, ignoreInitial: true, persistent: true });
		const pcssDebounced = debounce(pcssProcess, 200);
		pcssWatcher.on('change', pcssDebounced);
		pcssWatcher.on('add', pcssDebounced);

		const codeWatch = chokidar.watch('demo/src/spec-*.ts', { depth: 99, ignoreInitial: true, persistent: true });
		const generateDemoCodesFileDebounced = debounce(_generateDemoCodesFile, 200);
		codeWatch.on('change', generateDemoCodesFileDebounced);
		codeWatch.on('add', generateDemoCodesFileDebounced);
	}

	console.log('_buildDemo done');
}

const CODE_START = '//#region    ---------- code: '
const CODE_END = '//#endregion ---------- /code: '



type CodeItem = { name: string, code: string };


async function _generateDemoCodesFile() {
	const srcFiles = await glob('demo/src/spec*.ts');
	const codeItems: CodeItem[] = [];

	for (const file of srcFiles) {
		const content = await readFile(file, 'utf-8');
		const CODE_BLOCK_RG = /\/\/#region.*code:\s+(\w+).*[\s\S]([\s\S]*?)\/\/#endregion/gm
		const m = content.matchAll(CODE_BLOCK_RG);
		for (const item of m) {
			const [fullSelection, name, code] = item;
			codeItems.push({ name, code });
		}
	}

	let codeContent = '';
	for (let { name, code } of codeItems) {
		code = code.replace(/\`/g, '\\\`');
		code = code.replace(/\$/g, '\\$');
		codeContent += `

export const code_${name}	= \`
${code}\`;

		`
	}

	await writeFile('demo/src/_codes.ts', codeContent, 'utf-8');

}


