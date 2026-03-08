import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { customElement } from 'dom-native';
import { draggable } from '../../src';


@customElement('spec-basic')
export class SpecBasicView extends SpecView {
	name = 'spec-basic'
	doc = spec_dnd_basic
}

function dragSimplest(rootEl: HTMLElement) {
	// by default drag the source element
	draggable(rootEl, '.drag-me');//

	// Note: if draggable element is position: static, translateX/Y will be used, otherwise, top/left
}

function dragGhost(rootEl: HTMLElement) {
	// tell to drag a ghost, which is a clone by default
	draggable(rootEl, '.drag-me', { drag: 'ghost' });
}

function dragConstrained(rootEl: HTMLElement) {
	draggable(rootEl, '.drag-me', {
		constraints: {
			// closest selector from the source element
			container: '.container',
			// center of the source, can be 'top-left' | 'center' | 'box' ...
			hitbox: 'center'
		}
	});
}

const spec_dnd_basic: CodeDoc = {
	title: 'drag basic',
	jsPrefix: `
import { draggable } from '@dom-native/draggable'
	`,
	groups: [
		{
			items: [
				{
					title: 'Drag simplest',
					html: `
<div class="root-el">			
	<div class="box drag-me">drag me</div>
</div>
			`,
					js: dragSimplest
				},
				{
					title: 'Drag ghost (i.e., clone)',

					html: `
<div class="root-el">			
	<div class="box drag-me" >drag me</div>
</div>
			`,
					js: dragGhost
				},
				{
					title: 'Drag constrained (to center point)',

					html: `
<div class="root-el">			
	<div class="container">
			<div class="box drag-me" >drag me</div>
	</div>
</div>
			`,
					js: dragConstrained
				}
			]
		}
	]


}