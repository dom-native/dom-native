import { first, frag } from '../../src/index';


//#region    ---------- Test Runner ---------- 
document.addEventListener("DOMContentLoaded", function (event) {
	const tests = (<any>window).tests;

	// Run the test if there are some
	if (tests) {
		run(tests, {
			createItemEl: (name: string) => {
				return frag(`<li> ${label(name)} running</li>`).firstElementChild as HTMLElement;
			},
			failInnerHTML: (name: string, ex: any) => {
				return label(name) + ' FAILED ' + ex;
			},
			successInnerHTML: (name: string, val?: any) => {
				return label(name) + ' OK ';
			}
		});
	}

	const perfs = (<any>window).perfs;
	if (perfs) {
		run(perfs, {
			createItemEl: (name: string) => {
				return frag(`<li> ${label(name)} pref running</li>`).firstElementChild as HTMLElement;
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
	return "<strong>" + name + "</strong>";
}
//#endregion ---------- /Test Runner ----------

interface RunController {
	createItemEl: (name: string) => HTMLElement;
	failInnerHTML: (name: string, ex: any) => string;
	successInnerHTML: (name: string, val?: any) => string;
}

function run(fnByNames: { [fnName: string]: Function }, controller: RunController) {
	const outputEl = first("#output")!;

	var beforeReturn = null;

	if (fnByNames._init) {
		beforeReturn = fnByNames._init();
	}


	Promise.resolve(beforeReturn).then(function () {


		let result = Promise.resolve();

		let name, names = [];
		for (name in fnByNames) {
			if (name.indexOf("_init") !== -1 || name.indexOf("_beforeEach") !== -1) {
				continue;
			}
			names.push(name);
		}

		names.forEach(function (name) {
			result = result.then(function () {
				// do the before each if defined
				if (fnByNames._beforeEach) {
					fnByNames._beforeEach();
				}

				// create the html element for this test
				const itemEl = controller.createItemEl(name);
				outputEl.appendChild(itemEl);

				// run this test
				let p, fn = fnByNames[name], failEx: string | null = null;

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