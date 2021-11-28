import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { wait } from 'utils-min';
import { BaseHTMLElement, customElement, first, on, onEvent } from '../../src/index.js';
import { code_perfSimplest } from './_codes.js';

const IT = 10000;

type PerfResult = { beforePaint: number, afterPaint: number };
type PerfItem = { name: string, fn: (rootEl: HTMLElement) => Promise<void> };
const perfList: PerfItem[] = [{ name: 'perf-simplest', fn: startPerfSimplest }];

@customElement('spec-perf')
export class SpecPerfView extends SpecView {
	name = 'spec-perf';
	doc = spec_doc;

	async postDisplay() {
		// workaround - because we do not import dom-native, and @dom-native/infra does (alias is not fully working in vscode apparently)
		const self = (<unknown>this) as HTMLElement;

		for (const { name, fn } of perfList) {
			const rootEl = first(self, `.root-el.${name}`);
			if (rootEl == null) throw new Error(`ERROR - SpecPerfView - cannot find '.root-el.${name}'`);
			await wait(200);
			await fn(rootEl);
			await wait(200);
		}
	}
}

//#region    ---------- code: perfSimplest ----------
class PerfRawElement extends HTMLElement {
}
customElements.define('perf-raw', PerfRawElement);

class PerfBaseElement extends BaseHTMLElement {
}
customElements.define('perf-base', PerfBaseElement);


class PerfRawConnectedElement extends HTMLElement {
	a: string | undefined;
	connectedCallback() {
		this.a = '1';
	}
	disconnectedCallback() {
		this.a = '2';
	}
}
customElements.define('perf-raw-connected', PerfRawConnectedElement);






@customElement('perf-init')
class PerfInitElement extends BaseHTMLElement {
	a: string | undefined;
	init() {
		this.a = '';
	}
}


class PerfRawRenderElement extends HTMLElement {
	_init = false;
	connectedCallback() {
		if (!this._init) {
			this.innerHTML = '! ';
			this._init = true;
		}

	}
}
customElements.define('perf-raw-render', PerfRawRenderElement);


@customElement('perf-init-render')
class PerfInitRenderElement extends BaseHTMLElement {
	init() {
		this.innerHTML = '! ';
	}
}


class PerfRawShadowElement extends HTMLElement {
	a: string | undefined;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' }).innerHTML = '! ';
	}
	connectedCallback() {
		this.a = '';
	}
}
customElements.define('perf-raw-shadow', PerfRawShadowElement);

@customElement('perf-shadow')
class PerfShadowElement extends BaseHTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' }).innerHTML = '! ';
	}
}



class PerfRawOn extends HTMLElement {
	_init = false;

	connectedCallback() {
		if (!this._init) {
			on(this, 'click', () => {
				console.log('click');
			});
			on(this, 'pointerup', () => {
				console.log('pointerup');
			});
			this._init = true;
		}
	}
}
customElements.define('perf-raw-on', PerfRawOn);

@customElement('perf-on')
class PerfOn extends BaseHTMLElement {
	init() {
		on(this, 'click', () => {
			console.log('click');
		});
		on(this, 'pointerup', () => {
			console.log('pointerup');
		});
	}
}


@customElement('perf-at-on')
class PerfAtOn extends BaseHTMLElement {
	@onEvent('click')
	onElClick() {
		console.log('click');
	}
	@onEvent('pointerup')
	onElPointerup() {
		console.log('pointerup');
	}
}

async function startPerfSimplest(rootEl: HTMLElement): Promise<void> {
	const containerEl = first(rootEl, '.container')!;

	const items = ['div', 'span', 'perf-raw', 'perf-base', 'perf-raw-connected', 'perf-init', 'perf-raw-render', 'perf-init-render', 'perf-raw-shadow', 'perf-shadow', 'perf-raw-on', 'perf-on', 'perf-at-on'];

	const htmls: string[] = [];

	const perfs: [append: PerfResult, remove: PerfResult][] = [];

	for (const item of items) {
		let html = ''
		for (let i = 0; i < IT; i++) {
			html += `<${item}>. </${item}>`;
		}
		htmls.push(html);
	}

	for (let i = 0; i < items.length; i++) {
		const html = htmls[i];
		// reset and relax
		containerEl.innerHTML = '';
		await wait(300);

		// measure append
		const startAppend = performance.now();
		containerEl.innerHTML = html;
		const appendPerf = await processPerf(startAppend, containerEl);

		await wait(300);

		// measure remove
		const startRemove = performance.now();
		containerEl.innerHTML = '';
		const removePerf = await processPerf(startRemove, containerEl);

		perfs.push([appendPerf, removePerf]);
	}


	// print
	let reportHTML = '<strong>name</strong> <strong>append</strong> <strong>remove</strong>';
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const [appendPerf, removePerf] = perfs[i];
		containerEl.classList.add('perf-report');
		reportHTML += `
<strong>${item}</strong> <span>${formatTime(appendPerf.beforePaint)}</span> <span>${formatTime(removePerf.beforePaint)}</span>
		`
	}
	containerEl.innerHTML = reportHTML;

}

function processPerf(start: number, containerEl: HTMLElement): Promise<PerfResult> {
	return new Promise((res, rej) => {
		requestAnimationFrame(function () {
			const beforePaint = performance.now();
			requestAnimationFrame(function () {
				const afterPaint = performance.now();

				const result = {
					beforePaint: beforePaint - start,
					afterPaint: afterPaint - start
				}
				res(result);
			})
		})
	})
}

//#endregion ---------- /code: perfSimplest ---------- 



function formatTime(ms: number) {
	return `${ms.toFixed(2)}ms`;
}

const spec_doc: CodeDoc = {
	title: 'Performance (create 10,000 various elements)',
	jsPrefix: ``,
	groups: [
		{
			items: [
				{
					title: 'Element vs customElement',
					ts: code_perfSimplest,
					html: `
<div class="root-el perf-simplest">
  <div class="container" style="overflow: hidden; height: 40rem"></div>
</div>
			`
				}
			]
		}]


}