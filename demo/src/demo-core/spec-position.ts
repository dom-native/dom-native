import { CodeDoc, SpecView } from "../infra/index.js";
import { append, customElement, elem, first, on, position, Pos } from "dom-native";
import { wait } from "utils-min";
import { code_positionDemo, code_positionSimple } from "./_codes.js";

@customElement("spec-position")
export class SpecPositionView extends SpecView {
	name = "spec-position";
	doc = spec_doc;
}

//#region    ---------- code: positionDemo ----------
function positionDemo(rootEl: HTMLElement) {
	const testCtn = first(rootEl, ".test-content-position")!;

	// create the reference box
	const refEl = testCtn.appendChild(elem("div", { "class": "pos-ctn" }));

	append_dots(refEl, testCtn);

	// display the dots and labes
	for (const refPos of POS_NAMES) {
		// display the corresponding label
		const labelEl = append_pos_label(refPos, testCtn);
		const [ref_v, ref_h] = refPos;

		// To keep labels outside, we align the opposite side of the label
		const pos_v = ref_v == "T" ? "B" : ref_v == "B" ? "T" : "C";
		const pos_h = ref_h == "L" ? "R" : ref_h == "R" ? "L" : "C";
		let pos = (pos_v + pos_h) as Pos;

		if (refPos == "CC") {
			pos = "BC"; // Put label above the center dot
			labelEl.style.color = "black";
		}

		position(labelEl, refEl, { refPos, pos, gap: 8 });
	}

	// Top Right - Ls&Rs
	for (const el_pos of POS_NAMES) {
		if (!el_pos.includes("C")) {
			// Mapping to show how to use alignment to get directional behavior
			// (e.g., to be Top-Right of a point, align element's Bottom-Left)
			const map: Record<Pos, Pos> = { TL: "BR", TR: "BL", BL: "TR", BR: "TL" } as any;
			const pos = map[el_pos];
			const el = append_pos_el(pos, testCtn);
			position(el, refEl, { refPos: "TR", pos, gap: 8 });
		}
	}

	// Bottom Right - CC
	{
		const pos = "CC";
		const el = append_pos_el(pos, testCtn);
		position(el, refEl, { refPos: "BR", pos, gap: 100 });
	}

	// Top Left - TC & BC
	{
		const poses = ["BC", "TC"] as Pos[]; // BC is above, TC is below
		for (const pos of poses) {
			const el = append_pos_el(pos, testCtn);
			position(el, refEl, { refPos: "TL", pos, gap: 8 });
		}
	}

	// Bottom Left
	{
		const poses = ["CR", "CL"] as Pos[]; // CR is left, CL is right
		for (const pos of poses) {
			const el = append_pos_el(pos, testCtn);
			position(el, refEl, { refPos: "BL", pos, gap: 8 });
		}
	}
}

const POS_NAMES = ["TL", "TC", "TR", "CL", "CC", "CR", "BL", "BC", "BR"] as const;

function append_dots(refEl: HTMLElement, parent: HTMLElement) {
	// display the dots and labes
	for (const ref_pos of POS_NAMES) {
		// display the dot
		const dotEl = append_pos_dot(parent);
		position(dotEl, refEl, { refPos: ref_pos, pos: "CC" });
	}
}

function append_pos_el(textContent: string, parent: HTMLElement) {
	const el = elem("div", { class: "pos-el", $: { textContent } });
	parent.appendChild(el);
	return el;
}

function append_pos_dot(parent: HTMLElement) {
	const el = elem("div", { class: "pos-dot" });
	parent.appendChild(el);
	return el;
}

function append_pos_label(textContent: string, parent: HTMLElement) {
	const el = elem("div", { class: "pos-label", $: { textContent } });
	parent.appendChild(el);
	return el;
}
//#endregion ---------- /code: positionDemo ----------

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
					title: "Position Demo",
					html: `
<div class="test-content container">
  <div class="test-content-position"></div>
</div>`,
					ts: code_positionDemo,
					run: positionDemo,
				},
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
