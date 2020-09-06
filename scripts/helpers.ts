import chokidar from 'chokidar';
import { Bucket, getBucket } from 'cloud-bucket';
import { glob, pathExists, readFile, writeFile } from 'fs-extra-plus';
import * as jsyaml from 'js-yaml';
import debounce from 'lodash.debounce';
import * as Path from 'path';

//#region    ---------- site ---------- 

export async function uploadSite(localDir: string, bucketRoot: string) {
	const bucket = await loadBucket('jc-sites');
	await bucket.upload(localDir, bucketRoot);
}

async function loadBucket(bucketName: string): Promise<Bucket> {
	const fileName = '.buckets.yaml';
	let relDir = './';
	let content: string | undefined;
	let file: string | undefined;
	for (let i = 0; i < 3; i++) {
		file = Path.join(relDir, fileName);
		if (await pathExists(file)) {
			content = await readFile(file, 'utf-8');
			break;
		}
		relDir += '../';
	}

	if (content == null) {
		throw new Error(`ERROR - loadBucket - cannot find file '${fileName}' is the root or 3 parent directories`)
	}

	const yamlObj = await yaml(content);
	const bucketConfig = yamlObj.buckets?.[bucketName];

	if (bucketConfig == null) {
		throw new Error(`ERROR - loadBucket - cannot find 'buckets.${bucketName}' in yaml file ${file}`);
	}
	return getBucket({ ...bucketConfig, log: true });
}

async function yaml(content: string) {
	const yamlObj = jsyaml.load(content);
	if (!yamlObj) {
		throw new Error(`Could not load yaml`);
	}
	return yamlObj;
}
//#endregion ---------- /site ---------- 

//#region    ---------- demo code ---------- 
export async function buildDemoCode(watch = false) {
	await _generateDemoCodesFile();
	if (watch) {
		const codeWatch = chokidar.watch('demo/src/spec-*.ts', { depth: 99, ignoreInitial: true, persistent: true });
		const generateDemoCodesFileDebounced = debounce(_generateDemoCodesFile, 200);
		codeWatch.on('change', generateDemoCodesFileDebounced);
		codeWatch.on('add', generateDemoCodesFileDebounced);
	}
}


type CodeItem = { name: string, code: string };

export async function _generateDemoCodesFile() {
	const srcFiles = await glob('demo/src/spec*.ts');
	const codeItems: CodeItem[] = [];

	for (const file of srcFiles) {
		const content = await readFile(file, 'utf-8');
		// '//#region    ---------- code: '
		const CODE_BLOCK_RG = /\/\/#region.*code:\s+(\w+).*[\s\S]([\s\S]*?)\/\/#endregion/gm
		const m = content.matchAll(CODE_BLOCK_RG);
		for (const item of m) {
			const [fullSelection, name, code] = item;
			codeItems.push({ name, code });
		}
	}

	let codeContent = '';
	for (let { name, code } of codeItems) {
		code = code.replace(/\`/g, '\\\`'); //
		code = code.replace(/\$/g, '\\$');
		codeContent += `

export const code_${name}	= \`
${code}\`;

		`
	}

	await writeFile('demo/src/_codes.ts', codeContent, 'utf-8');

}

//#endregion ---------- /demo code ---------- 

