import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { customElement, first, on, OnEvent } from 'dom-native';
import { DragEventDetail, draggable } from '../../src';


@customElement('spec-dnd-basic')
export class SpecDndBasicView extends SpecView {
	name = 'spec-dnd-basic'
	doc = spec_dnd_basic
}

function simpleDrag(rootEl: HTMLElement) {

	// Makes all '.drag-me' element from rootEl draggable and droppable anywhere in the rootEl
	// {drag: 'ghost'} to drag the clone of the source (default: 'source' for dragging the source)
	// Note: O(1) binding - The selector '.drag-me' is 'live', meaning that the drag will get activated 
	//                      when a roolEl's matching '.drag-me' element will be recieve pointerdown
	draggable(rootEl, '.drag-me', { drag: 'ghost' });//

	rootEl.addEventListener('DROP', (evt: any) => {
		const clone = evt.detail.source.cloneNode(true);//

		// No matter where it is dropped, add it to the show-zone for this example
		first(rootEl, '.show-zone')!.append(clone);
	});//
}

function simpleDroppable(rootEl: HTMLElement) {

	// specifying a droppable (closest selector from the over el), will trigger drop event only on those elements
	draggable(rootEl, '.drag-me', { drag: 'ghost', droppable: '.drop-zone' });//

	// Note: using dom-native on(...) which wrapped rootEl.addEventListener and add selector and event namespacing (not used here)
	on(rootEl, 'DROP', (evt: OnEvent<DragEventDetail>) => {
		const clone = evt.detail.source.cloneNode(true);
		// here target can only be a '.drop-zone' element (from the over element)
		(<HTMLElement>evt.target).append(clone);
	});//

}

const spec_dnd_basic: CodeDoc = {
	title: 'dnd basic',
	jsPrefix: `
import { on, first } from 'dom-native'
import { draggable } from '@dom-native/draggable'
	`,
	groups: [
		{
			items: [
				{
					title: 'Simple Drag',
					html: `
<div class="root-el">			
	<h4>Drag this and drop anywhere</h4>			
	<div class="box drag-me">Drag Me</div>
	<h4>Clone will show here</h4>
	<div class="zone show-zone"></div>
</div>
			`,
					js: simpleDrag
				},
				{
					title: 'Simple Droppable',
					html: `
<div class="root-el">			
	<h4>Drag this</h4>			
	<div class="box square drag-me">Drag Me</div>
	<h4>Drop Zone</h4>
	<div class="zone drop-zone"></div>
</div>
			`,
					js: simpleDroppable
				}
			]
		}
	]

}