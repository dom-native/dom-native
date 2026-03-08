import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { customElement, on, OnEvent } from 'dom-native';
import { DragEventDetail, draggable } from '../../src';


@customElement('spec-dnd-nested')
export class SpecNestedView extends SpecView {
	name = 'spec-dnd-nested'
	doc = spec_doc
}

function simpleNested(rootEl: HTMLElement) {
	// NOTHING SPECIAL, nested supported. Here, (.card the container and .box are annotated with .drag-me and will be be activate below)//

	// specifying a droppable (closest selector from the over el), will trigger drop event only on those elements
	draggable(rootEl, '.drag-me', { drag: 'ghost', droppable: '.drop-zone' });//

	on(rootEl, 'DROP', (evt: OnEvent<DragEventDetail>) => {
		const clone = evt.detail.source.cloneNode(true);
		// here target can only be a '.drop-zone' element (from the over element)
		(<HTMLElement>evt.target).append(clone);
	});//
}


function simpleNestedWithStyle(rootEl: HTMLElement) {

	// Makes all '.drag-me' draggable 
	draggable(rootEl, '.drag-me', { drag: 'ghost' });//

	// on with selector '.drop-zone' from rootEl
	on(rootEl, 'DROP', '.drop-zone', (evt: OnEvent<DragEventDetail>) => {
		const clone = evt.detail.source.cloneNode(true);//

		// evt.selectTarget = '.drop-zone' element
		evt.selectTarget.append(clone);

		// reset border style
		evt.selectTarget.style.borderColor = 'var(--clr-bdr)';
	});//

	// Here additional styling logic on dragenter / dragleave the .drop-zone
	on(rootEl, 'DRAGENTER,DRAGLEAVE', '.drop-zone', (evt: OnEvent<DragEventDetail>) => {
		if (evt.type == 'DRAGENTER') {
			evt.selectTarget.style.borderColor = 'blue';
		} else if (evt.type == 'DRAGLEAVE') {
			evt.selectTarget.style.borderColor = 'var(--clr-bdr)';
		}
	});//	

}

const spec_doc: CodeDoc = {
	title: 'dnd nested',
	jsPrefix: `
import { on } from 'dom-native'
import { draggable } from '@dom-native/draggable'
	`,
	groups: [
		{
			items: [
				{
					title: 'Nested',
					html: `
<div class="root-el">			
	<h4>Drag card or box</h4>			
	<div class="card drag-me">
		<div class="box drag-me">Drag Me</div>
		<div class="box drag-me">Drag Me</div>
		<div class="box drag-me">Drag Me</div>
	</div>
	<h4>Drop here</h4>
	<div class="zone drop-zone"></div>
</div>
			`,
					js: simpleNested
				},
				{
					title: 'Nested with style',
					html: `
<div class="root-el">			
	<h4>Drag card or box</h4>			
	<div class="card drag-me">
		<div class="box drag-me">Drag Me</div>
		<div class="box drag-me">Drag Me</div>
		<div class="box drag-me">Drag Me</div>
	</div>
	<h4>Drop here</h4>
	<div class="zone drop-zone"></div>
</div>
			`,
					js: simpleNestedWithStyle
				}
			]
		}
	]

}