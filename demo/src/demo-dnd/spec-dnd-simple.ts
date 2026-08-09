import { CodeDoc, SpecView } from "../infra/index.js";
import { customElement, dnd } from "dom-native";
import { code_drag_simplest, code_drag_ghost, code_drag_constrained } from "./_codes";

@customElement("spec-dnd-simple")
export class SpecDndSimpleView extends SpecView {
	name = "spec-dnd-simple";
	doc = spec_dnd_basic;
}

function dragSimplest(rootEl: HTMLElement) {
	// by default drag the source element
	dnd.draggable(rootEl, ".drag-me"); //

	// Note: if draggable element is position: static, translateX/Y will be used, otherwise, top/left
}

function dragGhost(rootEl: HTMLElement) {
	// tell to drag a ghost, which is a clone by default
	dnd.draggable(rootEl, ".drag-me", { drag: "ghost" });
}

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

const spec_dnd_basic: CodeDoc = {
	title: "dnd simple",
	tsPrefix: `
import { dnd } from 'dom-native'
	`,
	groups: [
		{
			items: [
				{
					title: "Drag simplest",
					html: `
<div class="root-el">
	<div class="box drag-me">drag me</div>
</div>
			`,
					ts: code_drag_simplest,
					run: dragSimplest,
				},
				{
					title: "Drag ghost (i.e., clone)",

					html: `
<div class="root-el">
	<div class="box drag-me" >drag me</div>
</div>
			`,
					ts: code_drag_ghost,
					run: dragGhost,
				},
				{
					title: "Drag constrained (to center point)",

					html: `
<div class="root-el">
	<div class="container small">
			<div class="box drag-me" >drag me</div>
	</div>
</div>
			`,
					ts: code_drag_constrained,
					run: dragConstrained,
				},
			],
		},
	],
};
