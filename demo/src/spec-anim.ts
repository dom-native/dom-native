import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { easeBounce } from 'd3-ease';
import { adoptStyleSheets, anim, append, BaseHTMLElement, css, customElement } from '../../src';
import { code_animPie } from './_codes';

@customElement('spec-anim')
export class SpecAnimView extends SpecView {
	name = 'spec-anim'
	doc = spec_shadow_dom
	constructor() {
		super();
	}
}



//#region    ---------- code: animPie ---------- 

const PAD = 8;

const _shadowCss = css`
	:host{
		position: relative;
		display: block;
		height: 200px;
		width: 200px;
		padding: ${PAD}px;
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
`;

const dataPoints = [{ pct: 25, color: 'red' }, { pct: 40, color: 'blue' }, { pct: 20, color: 'green' }];

@customElement('anim-pie')
class AnimPie extends BaseHTMLElement {

	#canvasEl: HTMLCanvasElement;
	#divEl: HTMLElement;


	constructor() {
		super();
		[this.#canvasEl, this.#divEl] = append(this.attachShadow({ mode: 'open' }), `
			<canvas></canvas>
			<div></div>
		`) as [HTMLCanvasElement, HTMLElement];

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

//#endregion ---------- /code: animPie ----------


const spec_shadow_dom: CodeDoc = {
	title: 'Pie Anim',
	jsPrefix: ``,
	groups: [
		{
			items: [
				{
					title: 'animPie',
					html: `
<div class="root-el">
  <anim-pie></anim-pie>
</div>
			`,
					ts: code_animPie
				}
			]
		}
	]


}