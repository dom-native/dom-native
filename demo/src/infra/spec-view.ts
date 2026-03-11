import { all, BaseHTMLElement, first, on, pull } from 'dom-native';
// import './init-tslib.js';


interface CodeItem {
	title: string,
	html: string,
	hideHtmlCode?: boolean,
	hideTsCode?: boolean,
	hideJsCode?: boolean,
	tsPrefix?: string,
	ts?: string,
	jsPrefix?: string,
	js?: (itemEl: HTMLElement) => void,
	run?: (itemEl: HTMLElement) => void,
	css?: string // optional item css classes
}

export interface CodeDoc {
	title?: string,
	tsPrefix?: string,
	jsPrefix?: string,
	groups: {
		items: CodeItem[]
	}[]

}

on(document, 'pointercancel', function (evt) {
	// DEBUG: 
	// document.body.style.backgroundColor = 'red';
	// setTimeout(() => {
	// 	document.body.style.backgroundColor = '#fff';
	// }, 100);
});


export abstract class SpecView extends BaseHTMLElement {
	abstract name: string
	abstract doc: CodeDoc

	init() {
		super.init();
		this.innerHTML = _render(this.doc);
		all(this, 'code').forEach(el => (<any>window).hljs.highlightBlock(el));
	}

	postDisplay() {
		let itemSeq = 0;
		for (const group of this.doc.groups) {
			for (const item of group.items) {
				const itemId = `item_${itemSeq}`;
				itemSeq++;
				const itemEl = first(`#${itemId}`);
				if (itemEl) {
					const targetEl = first(itemEl, '.root-el') ?? itemEl;
					item.js?.(targetEl);
					item.run?.(targetEl);
				};
			}
		}
	}
}


function _render(doc: CodeDoc) {
	let itemSeq = 0;
	const groupItemsHTML: string[] = [];
	for (const group of doc.groups) {
		const itemHtml = group.items.map(item => {
			const itemId = `item_${itemSeq}`;
			itemSeq++;

			//// Render custom item function and result
			let fnBody: string | undefined;
			if (item.js) {
				const fnString = item.js.toString();
				fnBody = fnString.slice(fnString.indexOf("{") + 1, fnString.lastIndexOf("}")).trim();

				const jsPrefix = item.jsPrefix ?? doc.jsPrefix;
				if (jsPrefix) {
					fnBody = jsPrefix + '\n' + fnBody;
				}
			}

			let tsBody = item.ts;
			if (tsBody) {
				const tsPrefix = item.tsPrefix ?? doc.tsPrefix;
				if (tsPrefix) {
					tsBody = tsPrefix + '\n' + tsBody;
				}
			}

			return `
			<div id="${itemId}" class="item ${item.css || ''}">
				<h3>${item.title}</h3>
				<div class="html">${item.html}</div>
				${item.hideHtmlCode ? '' : `<pre><code class="html">${escapeHtml(formatCode(item.html, 'html'))}</code></pre>`}
				${tsBody && !item.hideTsCode ? `<pre><code class="typescript">${formatCode(tsBody, 'ts')}</code></pre>` : ''}
				${fnBody && !item.hideJsCode ? `<pre><code class="javascript">${formatCode(fnBody, 'jsBody')}</code></pre>` : ''}
			</div>`;
		}).join('\n');

		groupItemsHTML.push(itemHtml);
	}


	return `
	<h1>${doc.title}</h1>
	<section>
	${groupItemsHTML.map(groupItemsHtml => `<div class="panel">${groupItemsHtml}</div>`).join('\n')}
	</section>
	`
}


function escapeHtml(html: string) {

	// replace the start tags
	html = html.replace(/(<|<\/)(\w[\w-]*)/g, (match, start, name) => {
		start = start.replace('<', '&lt;');
		name = `<span class="tag">${name}</span>`;
		return start + name;
	});

	// replace attributes
	html = html.replace(/([\w-]+)=/g, (match, name) => {
		// hack for now to not encode the class="tag" attribute
		if (name === 'class') {
			return name + '=';
		} else {
			return `<span class="attr">${name}</span>=`;
		}
	});

	return html;
}

export function simplePull(containerEl: HTMLElement) {
	return pull(containerEl);
}

// poor man's job code trailing space formatting
function formatCode(codeText: string, type: 'html' | 'js' | 'jsBody' | 'ts'): string {


	// TODO if code, needs to escape the < inside the ` ` 
	if (type !== 'html') {
		codeText = codeText.replace(/</g, '&lt;');
	}


	const lines = codeText.split('\n');

	// remove first empty lines
	if (lines.length > 0 && lines[0].trim().length == 0) {
		lines.shift();
	}



	return lines.map(line => {
		// sometime rollup add ..$1 to classes, variable, need to remove them
		line = line.replace(/\$\d/g, '');

		// if jsBody, then, realign the left indent
		if (type === 'jsBody') {
			if (line.startsWith(' ') || line.startsWith('\t')) {
				const trimmed = line.trimLeft();
				const diff = line.length - trimmed.length;
				line = '  '.repeat(Math.max(diff / 3 - 2, 0)) + trimmed;
			}
		}

		// if anything but 
		line = line.trimRight();

		// replace all tabs by 2 space
		line = line.replace(/\t/g, '  ');

		// if only //, then, replace with empty, so that it will be one empty line
		if (line.trim() === '//') {
			line = '';
		}

		// replace all ending // by new line (TS remove empty lines, so workaround to get too presentation)
		else {
			line = line.replace(/\/\/$/g, '\n');
		}


		return line;
	}).join('\n');
}
