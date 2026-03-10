import { customElement, html } from "dom-native";
import { SpecView } from "../infra/spec-view.js";
import { testShowElsPositions, testShowMouseFollow, testShowRefPositions } from "./test-position-logic.js";

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
							const tests = {
								testShowMouseFollow,
								testShowRefPositions,
								testShowElsPositions,
							};
							const outputEl = itemEl.querySelector("#output") as HTMLUListElement;
							Object.entries(tests).forEach(([name, fn]) => {
								const li = html(`<li><strong>${name}</strong> running</li>`).firstElementChild as HTMLLIElement;
								outputEl.appendChild(li);
								try {
									const ret = fn();
									Promise.resolve(ret).then(() => {
										li.innerHTML = `<strong>${name}</strong> OK`;
									}).catch((ex) => {
										li.innerHTML = `<strong>${name}</strong> FAILED ${ex}`;
										li.classList.add("fail");
									});
								} catch (ex) {
									li.innerHTML = `<strong>${name}</strong> FAILED ${ex}`;
									li.classList.add("fail");
								}
							});
						},
					},
				],
			},
		],
	};
}

