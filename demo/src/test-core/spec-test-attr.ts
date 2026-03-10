import { customElement, html } from "dom-native";
import { SpecView } from "../infra/spec-view.js";
import { testGetSimple, testSetFalse, testSetMap, testSetNullInMap, testSetNum, testSetSimple, testSetTrue } from "./test-attr-logic.js";

@customElement("spec-test-attr")
export class SpecTestAttr extends SpecView {
	name = "test-attr";
	doc = {
		title: "dom-native test-attr",
		groups: [
			{
				items: [
					{
						title: "Attr tests runner",
						html: `
<div class="test-output">
  <h2>attr tests</h2>
  <ul id="output"></ul>
</div>`,
						run: (itemEl: HTMLElement) => {
							const tests = {
								testSetSimple,
								testGetSimple,
								testSetTrue,
								testSetFalse,
								testSetNum,
								testSetMap,
								testSetNullInMap,
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

