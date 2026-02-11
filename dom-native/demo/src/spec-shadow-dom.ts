import { adoptStyleSheets, BaseHTMLElement, css, customElement, html } from '#dom-native';
import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { code_shadowPart, code_shadowSimple, code_shadowSlot } from './_codes.js';

@customElement('spec-shadow-dom')
export class SpecShadowDom extends SpecView {
	name = 'spec-shadow-dom'
	doc = spec_shadow_dom
	constructor() {
		super();
	}
}

//#region    ---------- code: shadowSimple ---------- 
const _shadow_simple_css = css`
h3{ 
	display: inline; 
	color: red; 
	font-size: 1rem;
}
`;

@customElement('shadow-simple')
class ShadowSimple extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.innerHTML = `Hello from <h3>ShadowSimple</h3> constructor`;
		adoptStyleSheets(this, _shadow_simple_css);
	}
}
//#endregion ---------- /code: shadowSimple ---------- 

//#region    ---------- code: shadowPart ---------- 
@customElement('shadow-part')
class ShadowPart extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.innerHTML = `
<style>
/* basic style for h3, which can be overriden with css-part */
h3 { 
	display: inline; 
	color: red; 
	font-size: 1rem;
}
</style>

Hello from <h3 part="label">ShadowPart</h3> constructor

		`;
	}
}
//#endregion ---------- /code: shadowPart ----------

//#region    ---------- code: shadowSlot ---------- 
// This will create Template and return its .content, which could be cloned (shadow.innerHTML alternative)
const shadowSlotTmpl = html(`
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

`)

@customElement('shadow-slot')
class ShadowSlot extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.append(shadowSlotTmpl.cloneNode(true));
	}
}
//#endregion ---------- /code: shadowSlot ----------

const spec_shadow_dom: CodeDoc = {
	title: 'shadow dom',
	jsPrefix: ``,
	groups: [
		{
			items: [
				{
					title: 'Shadow Simple',
					html: `
<div class="root-el">
  <shadow-simple></shadow-simple>
</div>
			`,
					ts: code_shadowSimple
				},
				{
					title: 'Shadow CSS Part',
					html: `
<style>
shadow-part::part(label){ 
	color: blue;
}
</style>					
<div class="root-el">			
  <shadow-part></shadow-part>
</div>
			`,
					ts: code_shadowPart
				},
				{
					title: 'shadow slot',
					html: `
<style>
shadow-slot h3{ /* will override the component ::slotted(h3) */
	color: green;
}
</style>
				
<div class="root-el">			
  <shadow-slot><h3>slot</h3></shadow-slot>
</div>
			`,
					ts: code_shadowSlot
				}
			]
		}
	]


}