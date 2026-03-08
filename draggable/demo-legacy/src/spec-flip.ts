import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { all, append, BaseHTMLElement, closest, customElement, on, style } from 'dom-native';
import { activateDrag, capture } from '../../src';
import { code_flip } from './_codes';


@customElement('spec-flip')
export class SpecFlipView extends SpecView {
	name = 'spec_flip'
	doc = spec_doc
}

//#region    ---------- code: flip ---------- 
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


		activateDrag(panel, pointerDownEvt, {
			// NOTE 1 - the pointerCapture cannot be source (the default) since it will be re-attached causing a cancel
			//          @dom-native/draggable allows to set a custom pointerCapture
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
							const inv = capture(all(rootEl, 'c-panel'));

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

//#endregion ---------- /code: flip ---------- 



const spec_doc: CodeDoc = {
	title: 'FLIP animation',
	tsPrefix: `
import { all, append, BaseHTMLElement, closest, customElement, on, style } from 'dom-native';
import { activateDrag, capture } from '@dom-native/draggable';
	`,
	groups: [
		{
			items: [
				{
					title: 'Simple Flip example (still some corner cases not handled)',
					html: `
<div class="root">					
	<c-col>
		<c-panel class="">ONE</c-panel>
		<c-panel class="">TWO</c-panel>
		<c-panel class="">THREE</c-panel>
	</c-col>
</div>			
			`,
					ts: code_flip,
					run: enableDrag
				}
			]
		}
	]

}