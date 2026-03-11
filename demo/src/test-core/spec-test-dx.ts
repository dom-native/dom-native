import { customElement, html } from "dom-native";
import { SpecView } from "../infra/spec-view.js";
import { basidPull, basicPush, selectorPull, selectorPush, testEmptyProperties, testPushPullOnHtml } from "./test-dx-logic.js";

@customElement("spec-test-dx")
export class SpecTestDx extends SpecView {
	name = "test-dx";
	doc = {
		title: "dom-native test-dx",
		groups: [
			{
				items: [
					{
						title: "dx tests runner",
						html: `
<div class="test-output">
  <h2>dx tests</h2>
  <ul class="output"></ul>
</div>
<div class="test-content">
  <form class="form test-pull">
    <input class="dx" name="a" value="a-val" />
    <input class="dx" name="b" value="b-val" />
    <input class="dx" name="c1" value="c1-val" />
    <input class="dx" name="c3" value="c3-val-a" />
    <input class="dx" name="c3" value="c3-val-b" />
    <input class="dx" name="c4" value="c4-val-a" checked="checked" type="checkbox" />
    <input class="dx" name="c5" checked="checked" type="checkbox" />
    <input class="dx" name="r1" value="r1-val-a" checked="checked" type="radio" />
    <input class="dx" name="r1" value="r1-val-b" type="radio" />
    <input class="dx" name="r2" value="r2-val-a" checked="checked" type="radio" />
    <input class="dx" name="r2" value="r2-val-b" type="radio" />
    <textarea class="dx" name="d">d-val</textarea>
    <div class="dx" name="e">e-val</div>
  </form>
  <div class="custom-form">
    <div class="edit">
      <input class="dx" name="firstName" value="firstName1" />
      <input class="dx" name="lastName" value="lastName1" />
    </div>
    <div class="view">
      <div class="dx" name="firstName">aaa</div>
      <div class="dx" name="lastName">bbb</div>
    </div>
  </div>
  <div class="empty-props">
    <input class="dx" name="a" value="a1" />
    <textarea class="dx" name="b">b1</textarea>
    <div class="dx" name="c">c1</div>
    <div class="dx" name="d">d1</div>
  </div>
</div>`,
						run: (itemEl: HTMLElement) => {
							const tests = {
								basidPull,
								basicPush,
								selectorPull,
								selectorPush,
								testEmptyProperties,
								testPushPullOnHtml,
							};
							const outputEl = itemEl.querySelector(".output") as HTMLUListElement;
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
