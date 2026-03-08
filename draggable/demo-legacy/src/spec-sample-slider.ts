import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { closest, customElement, on, style } from 'dom-native';
import { activateDrag, draggable, DraggableEvent } from '../../src';


@customElement('spec-sample-slider')
export class SpecSliderView extends SpecView {
	name = 'spec-slider'
	doc = spec_doc
}



function simpleSlider(rootEl: HTMLElement) {

	draggable(rootEl, '.thumb', {
		// add some contraints, don't move y and keep keep source element contained in the closest container matching '.slider'
		constraints: {
			y: false,
			container: '.slider',
			hitbox: 'center'

		}
	});

}

function multiSlider(rootEl: HTMLElement) {

	draggable(rootEl, '.thumb', {
		// add some contraints, don't move y and keep keep source element contained in the closest container matching '.slider'
		constraints: {
			y: false,
			container: '.slider',
			hitbox: 'center'
		}
	});//

	draggable(rootEl, '.slider-zone', {
		constraints: {
			y: false,
			container: '.slider',
			hitbox: 'box'
		}
	})

}


function multiSliderWithHandle(rootEl: HTMLElement) {

	//// DRAG the .thumb (blue dot)
	draggable(rootEl, '.thumb', {
		// tell to drag the source element and not to create a ghost/clone
		drag: 'source',
		// add some contraints, don't move y and keep keep source element contained in the closest container matching '.slider'
		constraints: {
			y: false,
			container: '.slider',
			hitbox: 'center'
		}
	});//

	//// DRAG the .silder-zone
	// Here we need a little bit more control to activate the drag 
	// only if the click is directly on the .slider-zone and not on its .slider-handler children elements
	on(rootEl, 'pointerdown', '.slider-zone', function (evt) {
		if (evt.selectTarget === evt.target) {
			activateDrag(evt.selectTarget, evt, {
				drag: 'source',
				constraints: {
					y: false,
					container: '.slider',
					hitbox: 'box'
				}
			});
		}
	});//

	//// DRAG one of the two .slider-handle to resize
	draggable(rootEl, '.slider-handle', {
		drag: 'none',
		//
		onDragStart(evt) {
			// capturing the original states that will be used on each drag (avoiding to querying the DOM on drag)
			const zoneEl = closest(evt.detail.source, '.slider-zone')!;
			const sliderRect = closest(zoneEl, '.slider')!.getBoundingClientRect();
			const zoneOriginRect = zoneEl.getBoundingClientRect();//

			// set the event.detail.data with those states which will be carry to all drag event 
			evt.detail.data = { sliderRect, zoneEl, zoneOriginRect, zoneOriginOffsetLeft: zoneEl.offsetLeft }
		},
		//
		onDrag(evt: DraggableEvent<{ sliderRect: DOMRect, zoneEl: HTMLElement, zoneOriginRect: DOMRect, zoneOriginOffsetLeft: number }>) {
			const { originX, clientX, source: handleEl } = evt.detail;
			let dx = clientX - originX;
			const { sliderRect, zoneEl, zoneOriginRect, zoneOriginOffsetLeft } = evt.detail.data;

			if (handleEl.classList.contains('right')) {
				// box to the right
				let width = zoneOriginRect.width + dx;
				width = (zoneOriginRect.left + width > sliderRect.right) ? sliderRect.right - zoneOriginRect.left : width;
				style(zoneEl, { width: `${width}px` });
			} else if (handleEl.classList.contains('left')) {
				// box to the left
				dx = (zoneOriginRect.left + dx < sliderRect.left) ? sliderRect.left - zoneOriginRect.left : dx;
				style(zoneEl, {
					width: `${zoneOriginRect.width - dx}px`,
					left: `${zoneOriginOffsetLeft + dx}px`
				});
			}

		}
	});//	

}


function rawSlider(rootEl: HTMLElement) {
	// NOTE: Just a simplistic demonstration to do a draggable with @dom-native/draggable
	//       But, constraints, initial states, multi-touch drag, ghost, body cursor 
	//       all need to be reimplemented and does not work in the case below//

	let sliderRec: DOMRect;//

	on(rootEl, 'pointerdown', '.thumb', (evt) => {
		const thumb = evt.selectTarget;
		thumb.setPointerCapture(evt.pointerId);
		sliderRec = thumb.parentElement!.getBoundingClientRect()!;
	});//

	on(rootEl, 'pointermove', '.thumb', (evt) => {
		if (evt.buttons > 0) {
			let newLeft = evt.clientX - sliderRec.left;
			if (newLeft < 0) {
				newLeft = 0;
			} else if (newLeft > sliderRec.width) {
				newLeft = sliderRec.width;
			}
			evt.selectTarget.style.left = `${newLeft}px`;
		}
	});

}


const spec_doc: CodeDoc = {
	title: 'Slider',
	jsPrefix: `
import { on }	from 'dom-native'
import { draggable }	from '@dom-native/draggable'
	`,
	groups: [
		{
			items: [
				{
					title: 'Simple Drag',
					html: `
<div class="root-el">			
	<h4>Drag slider thumb</h4>			
	<div class="slider">
			<div class="thumb slide-me"></div>
	</div>
</div>
			`,
					js: simpleSlider
				},
				{
					title: 'Multi drag',
					html: `
<div class="root-el">			
	<h4>Drag slider thumb</h4>			
	<div class="slider" style="width: 20rem">
			<div class="slider-zone" style="width: 3rem; left: 64px"></div>
			<div class="thumb slide-me"></div>
	</div>
</div>
			`,
					js: multiSlider
				},
				{
					title: 'Multi drag with handles',
					html: `
<div class="root-el">			
	<h4>Drag slider thumb</h4>			
	<div class="slider" style="width: 20rem">
			<div class="slider-zone" style="width: 3rem;left: 64px">
				<div class="slider-handle left"></div>
				<div class="slider-handle right"></div>
			</div>
			<div class="thumb slide-me"></div>
	</div>
</div>
			`,
					js: multiSliderWithHandle
				},
				{
					title: 'Without dnd (raw PointerEvent)',
					html: `
<div class="root-el">			
	<h4>Drag slider thumb</h4>			
	<div class="slider">
			<div class="thumb slide-me"></div>
	</div>
</div>
			`,
					js: rawSlider
				}

			]
		}
	]

}