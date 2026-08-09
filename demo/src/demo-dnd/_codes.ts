

export const code_flip	= `
@customElement('c-panel')
export class PanelElement extends BaseHTMLElement {
	get col() { return this.parentElement as ColElement }
}

@customElement('c-col')
export class ColElement extends BaseHTMLElement {

	isBefore(cpanel: HTMLElement, ref: HTMLElement) {
		const cpanels = all(this, 'c-panel');
		for (const cp of cpanels) {
			if (cp === cpanel) {
				return true;
			}
			if (cp === ref) {
				return false;
			}
		}
		return false;
	}
}

function enableDrag(rootEl: HTMLElement) {

	// on pointerdown on a c-panel we start the drag action
	on(rootEl, 'pointerdown', 'c-panel', (pointerDownEvt) => {
		const panel = pointerDownEvt.selectTarget as PanelElement;

		// states
		let currentOver: HTMLElement | undefined;
		let currentOverPanel: PanelElement | undefined;
		let animationHappening = false;


			dnd.activateDrag(panel, pointerDownEvt, {
			// NOTE 1 - the pointerCapture cannot be source (the default) since it will be re-attached causing a cancel
			//          dom-native/dnd allows to set a custom pointerCapture
			// NOTE 2 - binding pointerCapture roolEl might have some significant performance impact on mobile devices (e.g.,, mobile safari).
			//          document.body shortest event path, and provides sensible performance gain on ipad.
			pointerCapture: document.body,

			// we will still drag the ghost (here could be 'none' as well)
			drag: 'ghost',

			// only used here to customize the ghost a little
			onDragStart: (evt) => {
				const { ghost } = evt.detail;

				style(ghost!, {
					opacity: '.5',
					background: 'red'
				});
			},

			onDrag: async (evt) => {

				// only proceed if no animation happening
				if (!animationHappening) {
					const { over } = evt.detail;

					// work further only if over has changed, that over is not self
					if (over != panel && over != currentOver) {
						let overPanel: PanelElement | undefined;
						// get the c-panel from the over
						overPanel = (over instanceof PanelElement) ? over : closest(over, 'c-panel') as PanelElement ?? undefined;

						// only perform animation overPanel is different
						if (overPanel != null && overPanel != currentOverPanel) {
							animationHappening = true;

							//// not-so-magic FLIP
							// 1) capture the panel positions
							const inv = dnd.capture(all(rootEl, 'c-panel'));

							// 2) move the panel
							const pos = panel.col.isBefore(panel, overPanel) ? 'after' : 'before';
							append(overPanel, panel, pos);

							// 3) invert the position (pretend nothing happen)
							const play = inv();

							// 4) play the animation (got to love closure state capture)
							await play();

							// Now we are done (play return a promise when the animation is done - approximation -)
							animationHappening = false;
							// reset the currents (in case user follow the moved item)
							currentOverPanel = undefined;
							currentOver = undefined;
						} else {
							// update state for the next onDrag
							currentOverPanel = overPanel;
							currentOver = over;
						}

					}
				}

			}// /onDrag

		}); // /activateDrag


	});

}

`;



export const code_drag_simplest = `
function dragSimplest(rootEl: HTMLElement) {
	// by default drag the source element
	dnd.draggable(rootEl, ".drag-me"); //

	// Note: if draggable element is position: static, translateX/Y will be used, otherwise, top/left
}
`;

export const code_drag_ghost = `
function dragGhost(rootEl: HTMLElement) {
	// tell to drag a ghost, which is a clone by default
	dnd.draggable(rootEl, ".drag-me", { drag: "ghost" });
}
`;

export const code_drag_constrained = `
function dragConstrained(rootEl: HTMLElement) {
	dnd.draggable(rootEl, ".drag-me", {
		constraints: {
			// closest selector from the source element
			container: ".container",
			// center of the source, can be 'top-left' | 'center' | 'box' ...
			hitbox: "center",
		},
	});
}
`;

export const code_simple_nested = `
function simpleNested(rootEl: HTMLElement) {
	// NOTHING SPECIAL, nested supported. Here, (.card the container and .box are annotated with .drag-me and will be be activate below)//

	// specifying a droppable (closest selector from the over el), will trigger drop event only on those elements
	dnd.draggable(rootEl, '.drag-me', { drag: 'ghost', droppable: '.drop-zone' });//

	on(rootEl, 'DROP', (evt: OnEvent<dnd.DragEventDetail>) => {
		const clone = evt.detail.source.cloneNode(true);
		// here target can only be a '.drop-zone' element (from the over element)
		(<HTMLElement>evt.target).append(clone);//
	});//
}
`;

export const code_simple_nested_with_style = `
function simpleNestedWithStyle(rootEl: HTMLElement) {

	// Makes all '.drag-me' draggable
	dnd.draggable(rootEl, '.drag-me', { drag: 'ghost' });//

	// on with selector '.drop-zone' from rootEl
	on(rootEl, 'DROP', '.drop-zone', (evt: OnEvent<dnd.DragEventDetail>) => {
		const clone = evt.detail.source.cloneNode(true);//

		// evt.selectTarget = '.drop-zone' element
		evt.selectTarget.append(clone);

		// reset border style
		evt.selectTarget.style.borderColor = 'var(--clr-bdr)';
	});//

	// Here additional styling logic on dragenter / dragleave the .drop-zone
	on(rootEl, 'DRAGENTER,DRAGLEAVE', '.drop-zone', (evt: OnEvent<dnd.DragEventDetail>) => {
		if (evt.type == 'DRAGENTER') {
			evt.selectTarget.style.borderColor = 'blue';
		} else if (evt.type == 'DRAGLEAVE') {
			evt.selectTarget.style.borderColor = 'var(--clr-bdr)';
		}
	});//

}
`;

export const code_simple_slider = `
function simpleSlider(rootEl: HTMLElement) {

	dnd.draggable(rootEl, '.thumb', {
		// add some contraints, don't move y and keep keep source element contained in the closest container matching '.slider'
		constraints: {
			y: false,
			container: '.slider',
			hitbox: 'center'
		}
	});

}
`;

export const code_multi_slider = `
function multiSlider(rootEl: HTMLElement) {

	dnd.draggable(rootEl, '.thumb', {
		// add some contraints, don't move y and keep keep source element contained in the closest container matching '.slider'
		constraints: {
			y: false,
			container: '.slider',
			hitbox: 'center'
		}
	});//

	dnd.draggable(rootEl, '.slider-zone', {
		constraints: {
			y: false,
			container: '.slider',
			hitbox: 'box'
		}
	})

}
`;

export const code_multi_slider_with_handle = `
function multiSliderWithHandle(rootEl: HTMLElement) {

	//// DRAG the .thumb (blue dot)
	dnd.draggable(rootEl, '.thumb', {
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
			dnd.activateDrag(evt.selectTarget, evt, {
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
	dnd.draggable(rootEl, '.slider-handle', {
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
		onDrag(evt: dnd.DraggableEvent<{ sliderRect: DOMRect, zoneEl: HTMLElement, zoneOriginRect: DOMRect, zoneOriginOffsetLeft: number }>) {
			const { originX, clientX, source: handleEl } = evt.detail;
			let dx = clientX - originX;
			const { sliderRect, zoneEl, zoneOriginRect, zoneOriginOffsetLeft } = evt.detail.data;

			if (handleEl.classList.contains('right')) {
				// box to the right
				let width = zoneOriginRect.width + dx;
				width = (zoneOriginRect.left + width > sliderRect.right) ? sliderRect.right - zoneOriginRect.left : width;
				style(zoneEl, { width: \`\${width}px\` });
			} else if (handleEl.classList.contains('left')) {
				// box to the left
				dx = (zoneOriginRect.left + dx < sliderRect.left) ? sliderRect.left - zoneOriginRect.left : dx;
				style(zoneEl, {
					width: \`\${zoneOriginRect.width - dx}px\`,
					left: \`\${zoneOriginOffsetLeft + dx}px\`
				});
			}

		}
	});//

}
`;

export const code_raw_slider = `
function rawSlider(rootEl: HTMLElement) {
	// NOTE: Just a simplistic demonstration to do a draggable with dom-native/dnd
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
			evt.selectTarget.style.left = \`\${newLeft}px\`;
		}
	});

}
`;

export const code_dnd_basic_simple_drag = `
import { on, first, dnd } from 'dom-native'

function simpleDrag(rootEl: HTMLElement) {
	// Makes all '.drag-me' element from rootEl draggable and droppable anywhere in the rootEl
	// {drag: 'ghost'} to drag the clone of the source (default: 'source' for dragging the source)
	// Note: O(1) binding - The selector '.drag-me' is 'live', meaning that the drag will get activated
	//                      when a roolEl's matching '.drag-me' element will be recieve pointerdown
	dnd.draggable(rootEl, ".drag-me", { drag: "ghost" }); //

	rootEl.addEventListener("DROP", (evt: any) => {
		const clone = evt.detail.source.cloneNode(true); //

		// No matter where it is dropped, add it to the show-zone for this example
		first(rootEl, ".show-zone")!.append(clone);
	}); //
}
`;

export const code_dnd_basic_simple_droppable = `
import { on, first, dnd } from 'dom-native'

function simpleDroppable(rootEl: HTMLElement) {
	// specifying a droppable (closest selector from the over el), will trigger drop event only on those elements
	dnd.draggable(rootEl, ".drag-me", { drag: "ghost", droppable: ".drop-zone" }); //

	// Note: using dom-native on(...) which wrapped rootEl.addEventListener and add selector and event namespacing (not used here)
	on(rootEl, "DROP", (evt: OnEvent<dnd.DragEventDetail>) => {
		const clone = evt.detail.source.cloneNode(true);
		// here target can only be a '.drop-zone' element (from the over element)
		(<HTMLElement>evt.target).append(clone);
	}); //
}
`;
