export const code_animPie = `

const PAD = 8;

const _shadowCss = css\`
	:host{
		position: relative;
		display: block;
		height: 200px;
		width: 200px;
		padding: \${PAD}px;
		border: solid 1px red;
		display: grid;
		align-items: center;
		justify-items: center;
	}
	canvas{
		position: absolute;
		margin: 0;
	}
	div{
		font-size: 2rem;
		color: #999;
		font-weight: 600;
		letter-spacing: .1em;
	}
\`;

const dataPoints = [{ pct: 25, color: 'red' }, { pct: 40, color: 'blue' }, { pct: 20, color: 'green' }];

@customElement('anim-pie')
class AnimPie extends BaseHTMLElement {

	#canvasEl: HTMLCanvasElement;
	#divEl: HTMLElement;


	constructor() {
		super();
		[this.#canvasEl, this.#divEl] = append(this.attachShadow({ mode: 'open' }), \`
			<canvas></canvas>
			<div></div>
		\`) as [HTMLCanvasElement, HTMLElement];

		adoptStyleSheets(this, _shadowCss);
	}

	postDisplay() {
		this.refresh();

	}

	async refresh() {
		// initialize the canvas
		const ctx = this.#canvasEl.getContext('2d')!;
		const h = this.clientHeight - PAD * 2;
		const w = this.clientWidth - PAD * 2;
		this.#canvasEl.width = w;
		this.#canvasEl.height = h;
		const x = w / 2, y = h / 2, radius = h / 2, width = h / 6;


		// Compute the pieItems from the dataPoints
		const pieItemBase = { x, y, radius, width };
		let prevNend = 0;
		const pieItems: PieItem[] = dataPoints.map(data => {
			const nend = data.pct / 100 + prevNend;
			const pp = {
				...pieItemBase,
				nstart: prevNend,
				nend,
				color: data.color
			}
			prevNend = nend;
			return pp;
		})

		const total = dataPoints.reduce((sum, data) => { return sum + data.pct }, 0);

		// animate the canvas, with ntime being the normalized time (multiplier) from 0 to 1
		// Note: easing method is optional, dom-native does not provide any. here easeBounce is from d3-ease.
		//       import { easeBounce } from 'd3-ease';
		await anim((ntime) => {
			// refresh the div value
			this.#divEl.textContent = '' + Math.round(ntime * total);

			// refresh the canvas
			ctx.clearRect(0, 0, w, h);
			pieItems.forEach(p => {
				const pt: PieItem = { ...p, nstart: p.nstart * ntime, nend: p.nend * ntime };
				drawPie(ctx, pt);
			});

		}, 2000, easeBounce);


	}


}

// Augment the global TagName space to match runtime
declare global {
	interface HTMLElementTagNameMap {
		'anim-pie': AnimPie;
	}
}


type PieItem = {
	x: number,
	y: number,
	nstart: number, // normalized (0..1) start
	nend: number, // normalized (0..1) end
	radius: number,
	width: number,
	color: string
}


function drawPie(ctx: CanvasRenderingContext2D, pieItem: PieItem) {
	const { x, y, nstart, nend, radius, width, color } = pieItem;

	// calc size of our wedge in radians
	const startRad = nstart * Math.PI * 2 - Math.PI / 2;
	const endRad = nend * Math.PI * 2 - Math.PI / 2;
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 3;
	ctx.fillStyle = color;
	ctx.beginPath();
	// see https://stackoverflow.com/a/8031173/686724
	ctx.arc(x, y, radius, startRad, endRad, false); // outer (filled)
	ctx.arc(x, y, radius - width, endRad, startRad, true); // inner (unfills it)
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

}

`;

export const code_simpleElement = `
// BaseHTMLElement is a simple class extending DOM HTMLElement
//                 with minimum but expressive lifecycle with
//                 init, preDisplay, postDisplay, and event bindings
class SimpleElement extends BaseHTMLElement {
	// will be called only once, on first connectedCallback
	init() {
		this.innerHTML = "!!! Hello from SimpleElement !!!";
	}
}
customElements.define("simple-element", SimpleElement);
`;

export const code_simpleElement2 = `
@customElement("simple-element-2") // dom-native provide this ts decorator
class SimpleElement2 extends BaseHTMLElement {
	private _mode?: "warning" | "info";
	set mode(m: "warning" | "info") {
		this._mode = m;
		this.style.background = m == "warning" ? "yellow" : m == "info" ? "#DDDDFF" : "#FFF";
	}

	init() {
		this.innerHTML = "Simple @customElement decorator";
	}

	// before the first paint (allows to further intialize the element with eventual data added after the parentEl.append )
	preDisplay() {
		this.innerHTML += " - mode: " + this._mode;
	}
}
`;

export const code_eventSimple = `
@customElement('event-simple')
class EventSimple extends BaseHTMLElement {

	//// @onEvent decorator way to bind an event
	@onEvent('pointerup', '.clickable-1')
	onClickableClick(evt: PointerEvent & OnEvent) {
		const el = evt.selectTarget; // from OnEvent type
		const bkg = el.style.background;
		el.style.background = 'red';
		setTimeout(function () { el.style.background = bkg }, 500);
	}


	init() {
		// called by BaseHTMLElement on first connectedCallback
		this.innerHTML = \`
Some <span class="clickable-1">clickable-1</span> <span class="clickable-2">clickable-2</span>
		\`;

		//// on() way to bind an event
		on(this, 'pointerup', '.clickable-2', (evt) => {
			const el = evt.selectTarget; // this is the .clickable el
			const bkg = el.style.background;
			el.style.background = 'blue';
			setTimeout(function () { el.style.background = bkg }, 500);
		});
	}



}
`;

export const code_eventShadow = `
@customElement('event-shadow')
class EventShadow extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.innerHTML = \`
<style>
:host .clickable-1, :host .clickable-2{
	cursor: pointer;
	border: solid 1px blue;
	padding: .5rem;
}
</style>
Some <span class="clickable-1">clickable-1</span> <span class="clickable-2">clickable-2</span>
		\`;
	}

	// NOTE - when .shadowRoot defined, @onEvent binds to component .shadowRoot
	@onEvent('pointerup', '.clickable-1')
	onClickableClick(evt: PointerEvent & OnEvent) {
		const el = evt.selectTarget; // from OnEvent type
		const bkg = el.style.background;
		el.style.background = 'red';
		setTimeout(function () { el.style.background = bkg }, 500);
	}

	init() {
		// making sure to bind to .shadowRoot when binding "manually"
		on(this.shadowRoot, 'pointerup', '.clickable-2', (evt) => {
			const el = evt.selectTarget; // this is the .clickable el
			const bkg = el.style.background;
			el.style.background = 'blue';
			setTimeout(function () { el.style.background = bkg }, 500);
		});
	}
}
`;

export const code_perfSimplest = `
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
			html += \`<\${item}>. </\${item}>\`;
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
		reportHTML += \`
<strong>\${item}</strong> <span>\${formatTime(appendPerf.beforePaint)}</span> <span>\${formatTime(removePerf.beforePaint)}</span>
		\`
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

`;

export const code_shadowSimple = `
const _shadow_simple_css = css\`
h3{
	display: inline;
	color: red;
	font-size: 1rem;
}
\`;

@customElement('shadow-simple')
class ShadowSimple extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.innerHTML = \`Hello from <h3>ShadowSimple</h3> constructor\`;
		adoptStyleSheets(this, _shadow_simple_css);
	}
}
`;

export const code_shadowPart = `
@customElement('shadow-part')
class ShadowPart extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.innerHTML = \`
<style>
/* basic style for h3, which can be overriden with css-part */
h3 {
	display: inline;
	color: red;
	font-size: 1rem;
}
</style>

Hello from <h3 part="label">ShadowPart</h3> constructor

		\`;
	}
}
`;

export const code_shadowSlot = `
// This will create Template and return its .content, which could be cloned (shadow.innerHTML alternative)
const shadowSlotTmpl = html(\`
<style>
::slotted(h3){
	display: inline;
	font-size: 1rem;
	padding: 0 1rem;
	color: blue;
	border: solid 1px #ddd;
	margin: 0 .5rem;
}
</style>

Hello from <slot>placeholder</slot> constructor

\`)

@customElement('shadow-slot')
class ShadowSlot extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.append(shadowSlotTmpl.cloneNode(true));
	}
}
`;

export const code_positionSimple = `
function positionSimple(rootEl: HTMLElement) {


	on(rootEl, 'pointerup', '.clickable', async (evt) => {

		// NOTE: here we do some cleanup, but the problem with SpecView not fully resolved becase of dom-native aliased
		//       prevents to do the disconnectedCallback on SpecPositionView
		first("#popup-pos")?.remove();

		// Note: Position assume the element to be positioned is absolute
		const [popupEl] = append(document.body, \`
			<div id="popup-pos"
						style="position: absolute; top: 0; left: 0; width: 8rem; height: 8rem; background: blue; opacity: .9">
			</div>\`);//

		const clickableEl = evt.selectTarget;
		popupEl.style.visibility = 'visible';
		if (clickableEl.matches('.right')) {
			position(popupEl, evt.selectTarget, { refPos: 'TR', pos: 'TL', gap: 8 });
		} else if (clickableEl.matches('.top')) {
			position(popupEl, evt.selectTarget, { refPos: 'TC', pos: 'BC', gap: 8 });
		} else if (clickableEl.matches('.left')) {
			position(popupEl, evt.selectTarget, { refPos: 'TL', pos: 'TR', gap: 8 });
		} else if (clickableEl.matches('.bottom')) {
			position(popupEl, evt.selectTarget, { refPos: 'BC', pos: 'TC', gap: 8 });
		} else if (clickableEl.matches('.bottom-center')) {
			position(popupEl, evt.selectTarget, { refPos: 'BC', pos: 'TC', gap: 8 });
		} else if (clickableEl.matches('.right-bottom')) {
			position(popupEl, evt.selectTarget, { refPos: 'BR', pos: 'BL', gap: 8 });
		} else if (clickableEl.matches('.right-center')) {
			position(popupEl, evt.selectTarget, { refPos: 'CR', pos: 'CL', gap: 8 });
		} else if (clickableEl.matches('.left-center')) {
			position(popupEl, evt.selectTarget, { refPos: 'CL', pos: 'CR', gap: 8 });
		}

		// Cleanup
		await wait(1000);
		popupEl.remove();

	});
}
`;
export const code_positionDemo = `
function positionDemo(rootEl: HTMLElement) {
	const testCtn = first(rootEl, ".test-content-position")!;

	// create the reference box
	const refEl = testCtn.appendChild(elem("div", { "class": "pos-ctn" }));

	append_dots(refEl, testCtn);

	// display the dots and labes
	for (const refPos of POS_NAMES) {
		// display the corresponding label
		const labelEl = append_pos_label(refPos, testCtn);
		const [ref_v, ref_h] = refPos;

		// To keep labels outside, we align the opposite side of the label
		const pos_v = (ref_v == "T") ? "B" : (ref_v == "B") ? "T" : "C";
		const pos_h = (ref_h == "L") ? "R" : (ref_h == "R") ? "L" : "C";
		let pos = (pos_v + pos_h) as Pos;

		if (refPos == "CC") {
			pos = "BC"; // Put label above the center dot
			labelEl.style.color = "black";
		}

		position(labelEl, refEl, { refPos, pos, gap: 8 });
	}

	// Top Right - Ls&Rs
	for (const el_pos of POS_NAMES) {
		if (!el_pos.includes("C")) {
			// Mapping to show how to use alignment to get directional behavior
			// (e.g., to be Top-Right of a point, align element's Bottom-Left)
			const map: Record<Pos, Pos> = { "TL": "BR", "TR": "BL", "BL": "TR", "BR": "TL" } as any;
			const pos = map[el_pos];
			const el = append_pos_el(pos, testCtn);
			position(el, refEl, { refPos: "TR", pos, gap: 8 });
		}
	}

	// Bottom Right - CC
	{
		const pos = "CC";
		const el = append_pos_el(pos, testCtn);
		position(el, refEl, { refPos: "BR", pos, gap: 100 });
	}

	// Top Left - TC & BC
	{
		const poses = ["BC", "TC"] as Pos[]; // BC is above, TC is below
		for (const pos of poses) {
			const el = append_pos_el(pos, testCtn);
			position(el, refEl, { refPos: "TL", pos, gap: 8 });
		}
	}

	// Bottom Left
	{
		const poses = ["CR", "CL"] as Pos[]; // CR is left, CL is right
		for (const pos of poses) {
			const el = append_pos_el(pos, testCtn);
			position(el, refEl, { refPos: "BL", pos, gap: 8 });
		}
	}
}

const POS_NAMES = ["TL", "TC", "TR", "CL", "CC", "CR", "BL", "BC", "BR"] as const;

function append_dots(refEl: HTMLElement, parent: HTMLElement) {
	// display the dots and labes
	for (const ref_pos of POS_NAMES) {
		// display the dot
		const dotEl = append_pos_dot(parent);
		position(dotEl, refEl, { refPos: ref_pos, pos: "CC" });
	}
}

function append_pos_el(textContent: string, parent: HTMLElement) {
	const el = elem("div", { class: "pos-el", $: { textContent } });
	parent.appendChild(el);
	return el;
}

function append_pos_dot(parent: HTMLElement) {
	const el = elem("div", { class: "pos-dot" });
	parent.appendChild(el);
	return el;
}

function append_pos_label(textContent: string, parent: HTMLElement) {
	const el = elem("div", { class: "pos-label", $: { textContent } });
	parent.appendChild(el);
	return el;
}
`;
// This will create Template and return its .content, which could be cloned (shadow.innerHTML alternative)
const shadowSlotTmpl = `html(\`
<style>
::slotted(h3){
	display: inline;
	font-size: 1rem;
	padding: 0 1rem;
	color: blue;
	border: solid 1px #ddd;
	margin: 0 .5rem;
}
</style>

Hello from <slot>placeholder</slot> constructor


@customElement('shadow-slot')
class ShadowSlot extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.append(shadowSlotTmpl.cloneNode(true));
	}
}
`;
