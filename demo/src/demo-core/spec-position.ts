import { CodeDoc, SpecView } from "../infra/index.js";
import { append, customElement, first, on, position } from "dom-native";
import { wait } from "utils-min";
import { code_positionSimple } from "./_codes.js";

@customElement("spec-position")
export class SpecPositionView extends SpecView {
	name = "spec-position";
	doc = spec_doc;
}

//#region    ---------- code: positionSimple ----------
function positionSimple(rootEl: HTMLElement) {
	on(rootEl, "pointerup", ".clickable", async (evt) => {
		// NOTE: here we do some cleanup, but the problem with SpecView not fully resolved becase of dom-native aliased
		//       prevents to do the disconnectedCallback on SpecPositionView
		first("#popup-pos")?.remove();

		// Note: Position assume the element to be positioned is absolute
		const [popupEl] = append(
			document.body,
			`
			<div id="popup-pos"
						style="position: absolute; top: 0; left: 0; width: 4rem; height: 4rem; background: blue; opacity: .9">
			</div>`,
		); //

		const clickableEl = evt.selectTarget;
		popupEl.style.visibility = "visible";
		if (clickableEl.matches(".right")) {
			position(popupEl, clickableEl, { refPos: "TR", pos: "TL"});
		} else if (clickableEl.matches(".top")) {
			position(popupEl, clickableEl, { refPos: "TC", pos: "TC"});
		} else if (clickableEl.matches(".left")) {
			position(popupEl, clickableEl, { refPos: "TL", pos: "TL"});
		} else if (clickableEl.matches(".bottom")) {
			position(popupEl, clickableEl, { refPos: "BC", pos: "BC"});
		} else if (clickableEl.matches(".bottom-center")) {
			position(popupEl, clickableEl, { refPos: "BC", pos: "TC"});
		} else if (clickableEl.matches(".right-bottom")) {
			position(popupEl, clickableEl, { refPos: "BR", pos: "BL"});
		} else if (clickableEl.matches(".right-center")) {
			position(popupEl, clickableEl, { refPos: "CR", pos: "CL"});
		} else if (clickableEl.matches(".left-center")) {
			position(popupEl, clickableEl, { refPos: "CL", pos: "CR"});
		}

		// Cleanup
		// await wait(1000);
		// popupEl.remove();
	});
}
//#endregion ---------- /code: positionSimple ----------

const spec_doc: CodeDoc = {
	title: "dom-native position",
	jsPrefix: ``,
	groups: [
		{
			items: [
				{
					title: "Simple Position",
					html: `
<div class="root-el">
	<span class="clickable left">show top left</span>
	<span class="clickable top">show top</span>
	<span class="clickable bottom">show bottom</span>
	<span class="clickable right">show right</span>
	<span class="clickable bottom-center">show bottom center</span>
	<span class="clickable right-bottom">show right bottom</span>
	<span class="clickable left-center">show left center</span>
	<span class="clickable right-center">show right center</span>
</div>
			`,
					ts: code_positionSimple,
					run: positionSimple,
				},
			],
		},
	],
};
