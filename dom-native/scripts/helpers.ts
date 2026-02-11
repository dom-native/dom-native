import chokidar from 'chokidar';
import { glob } from 'fs-aux';
import { readFile, writeFile } from 'fs/promises';
import debounce from 'lodash.debounce';


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

