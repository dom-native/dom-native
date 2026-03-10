import { customElement, html } from "dom-native";
import { SpecView } from "../infra/spec-view.js";
import { showElsPositions, showMouseFollow, showRefPositions } from "./test-position-logic.js";

@customElement("spec-test-position")
export class SpecTestPosition extends SpecView {
	name = "test-position";
	doc = {
		title: "dom-native test-position",
		groups: [
			{
				items: [
					{
						title: "Position tests",
						html: `
<div class="test-output">
  <h2>position tests</h2>
  <ul id="output"></ul>
</div>
<div class="test-content container">
  <div class="test-content-position"></div>
</div>`,
						run: (itemEl: HTMLElement) => {
							// NOTE: This is just a visual test for now
							showMouseFollow();
							showRefPositions();
							showElsPositions();
						},
					},
				],
			},
		],
	};
}
