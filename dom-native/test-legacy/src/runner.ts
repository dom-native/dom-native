import { first, html } from '#dom-native';


// JC-NOTE 2023-12-31: Test order are probably still dependent on order. Need to cleanup.


/** Manual fail test by function name */
export function fail_test(name: string, message: string) {
	const el = first(`li[data-test='${name}'`)!;
	el.classList.add("fail");
	el.innerHTML = label(name) + `<span class="result">FAILED ` + message + '</span>';;
}

//#region    ---------- Test Runner ---------- 
document.addEventListener("DOMContentLoaded", function (event) {
	const tests = (<any>window).tests;

	// Run the test if there are some
	if (tests) {
		run(tests, {
			createItemEl: (name: string) => {
				return html(`<li data-test="${name}"> ${label(name)} running</li>`).firstElementChild as HTMLElement;
			},
			failInnerHTML: (name: string, ex: any) => {
				return label(name) + `<span class="result">FAILED ` + ex + '</span>';
			},
			successInnerHTML: (name: string, val?: any) => {
				return label(name) + '<span class="result">OK</span>';
			}
		});
	}

	const perfs = (<any>window).perfs;
	if (perfs) {
		run(perfs, {
			createItemEl: (name: string) => {
				return html(`<li> ${label(name)} perf running</li>`).firstElementChild as HTMLElement;
			},
			failInnerHTML: (name: string, ex: any) => {
				return label(name) + ' FAILED ' + ex;
			},
			successInnerHTML: (name: string, val?: any) => {
				return label(name) + `<br /> ${val} `;
			}
		});
	}


});

function label(name: string) {
	return "<label>" + name + "</label>";
}
//#endregion ---------- /Test Runner ----------

interface RunController {
	createItemEl: (name: string) => HTMLElement;
	failInnerHTML: (name: string, ex: any) => string;
	successInnerHTML: (name: string, val?: any) => string;
}

function run(tests: { [fnName: string]: any }, controller: RunController) {
	const outputEl = first("#output")!;

	var beforeReturn = null;
	if (tests._init) {
		beforeReturn = tests._init();
	}


	Promise.resolve(beforeReturn).then(function () {


		let result = Promise.resolve();

		let name;

		const testFns: Function[] = (tests._only) ? tests._only : [];

		if (testFns.length === 0) {
			for (name in tests) {
				if (!name.startsWith("_")) {
					testFns.push(tests[name]);
				}
			}
		}

		testFns.forEach(function (fn) {
			const name = fn.name;

			result = result.then(function () {
				// run this test
				let p, failEx: string | null = null;

				// do the before each if defined
				if (tests._beforeEach) {
					tests._beforeEach();
				}

				// create the html element for this test
				const itemEl = controller.createItemEl(name);
				outputEl.appendChild(itemEl);


				try {
					p = fn();
				} catch (ex) {
					failEx = controller.failInnerHTML(name, ex);
					itemEl.classList.add("fail");
					console.log(ex);
				}

				// always resolve (to allow to continue to next test) and show appropriate message
				return Promise.resolve(p).then(function (val: any) {
					itemEl.innerHTML = (failEx) ? failEx : controller.successInnerHTML(name, val);
				}).catch(function (ex) {
					failEx = controller.failInnerHTML(name, ex);
					itemEl.innerHTML = failEx;
					itemEl.classList.add("fail");
					console.log(ex);
				});
			});
		});

		return result;
	});
}