import { BaseHTMLElement, customElement, on, onEvent, OnEvent } from '#dom-native';
import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { code_eventShadow, code_eventSimple } from './_codes.js';

@customElement('spec-event')
export class SpecEventView extends SpecView {
	name = 'spec-events'
	doc = spec_doc
	constructor() {
		super();
	}
}

//#region    ---------- code: eventSimple ----------
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
		this.innerHTML = `
Some <span class="clickable-1">clickable-1</span> <span class="clickable-2">clickable-2</span>
		`;

		//// on() way to bind an event
		on(this, 'pointerup', '.clickable-2', (evt) => {
			const el = evt.selectTarget; // this is the .clickable el
			const bkg = el.style.background;
			el.style.background = 'blue';
			setTimeout(function () { el.style.background = bkg }, 500);
		});
	}



}
//#endregion ---------- /code: eventSimple ---------- 

//#region    ---------- code: eventShadow ---------- 
@customElement('event-shadow')
class EventShadow extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.innerHTML = `
<style>
:host .clickable-1, :host .clickable-2{
	cursor: pointer;
	border: solid 1px blue;
	padding: .5rem;
}
</style>
Some <span class="clickable-1">clickable-1</span> <span class="clickable-2">clickable-2</span>
		`;
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
//#endregion ---------- /code: eventShadow ---------- 


const spec_doc: CodeDoc = {
	title: 'Event Binding micro wrappers (on() and @onEvent)',
	jsPrefix: ``,
	groups: [
		{
			items: [
				{
					title: '@onEvent and on() on custom element',
					html: `
<div class="root-el">
  <event-simple></event-simple>
</div>
			`,
					ts: code_eventSimple
				},
				{
					title: '@onEvent and on() on shadow-dom component',
					html: `
<div class="root-el">
  <event-shadow></event-shadow>
</div>
			`,
					ts: code_eventShadow
				}
			]
		}
	]


}