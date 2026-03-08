import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { append, customElement, first, on } from 'dom-native';
import { wait } from 'utils-min';
import { position } from '../../src';
import { code_positionSimple } from './_codes';


@customElement('spec-position')
export class SpecPositionView extends SpecView {
	name = 'spec-position'
	doc = spec_doc
}

//#region    ---------- code: positionSimple ---------- 
function positionSimple(rootEl: HTMLElement) {


	on(rootEl, 'pointerup', '.clickable', async (evt) => {

		// NOTE: here we do some cleanup, but the problem with SpecView not fully resolved becase of dom-native aliased 
		//       prevents to do the disconnectedCallback on SpecPositionView
		first("#popup-pos")?.remove();

		// Note: Position assume the element to be positioned is absolute
		const [popupEl] = append(document.body, `
			<div id="popup-pos" 
						style="position: absolute; top: 0; left: 0; width: 8rem; height: 8rem; background: blue; opacity: .9">
			</div>`);//

		const clickableEl = evt.selectTarget;
		popupEl.style.visibility = 'visible';
		if (clickableEl.matches('.right')) {
			position(popupEl, evt.selectTarget, 'right');
		} else if (clickableEl.matches('.top')) {
			position(popupEl, evt.selectTarget, 'top');
		} else if (clickableEl.matches('.left')) {
			position(popupEl, evt.selectTarget, 'left');
		} else if (clickableEl.matches('.bottom')) {
			position(popupEl, evt.selectTarget, 'bottom');
		} else if (clickableEl.matches('.bottom-center')) {
			position(popupEl, evt.selectTarget, { at: 'bottom', align: 'center' });
		} else if (clickableEl.matches('.right-bottom')) {
			position(popupEl, evt.selectTarget, { at: 'right', align: 'bottom' });
		} else if (clickableEl.matches('.right-center')) {
			position(popupEl, evt.selectTarget, { at: 'right', align: 'center' });
		} else if (clickableEl.matches('.left-center')) {
			position(popupEl, evt.selectTarget, { at: 'left', align: 'center' });
		}

		// Cleanup
		await wait(1000);
		popupEl.remove();

	});
}
//#endregion ---------- /code: positionSimple ---------- 



const spec_doc: CodeDoc = {
	title: 'dom-native position',
	jsPrefix: ``,
	groups: [
		{
			items: [
				{
					title: 'Simple Position',
					html: `
<div class="root-el">			
	<span class="clickable left">show left</span>
	<span class="clickable top">show top</span>
	<span class="clickable bottom">show bottom</span>
	<span class="clickable right">show right</span>
	<span class="clickable bottom-center">show at: bottom align: center</span>
	<span class="clickable right-bottom">show at: right, align: bottom</span>
	<span class="clickable left-center">show at: left, align: center</span>
	<span class="clickable right-center">show at: right, align: center</span>
</div>
			`,
					ts: code_positionSimple,
					run: positionSimple
				}
			]
		}
	]


}