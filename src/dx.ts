import { all } from './dom';
import { asArray, val } from './utils';

type PusherFn = (value: any) => void;
type PullerFn = (existingValue: any) => any;

const _pushers: [string, PusherFn][] = [

	["input[type='checkbox'], input[type='radio']", function (this: HTMLInputElement, value: any) {
		const iptValue = this.value || "on"; // as some browsers default to this

		// if the value is an array, it need to match this iptValue
		if (value instanceof Array) {
			if (value.indexOf(iptValue) > -1) {
				this.checked = true;
			}
		}
		// otherwise, if value is not an array,
		else if ((iptValue === "on" && value) || iptValue === value) {
			this.checked = true;
		}
	}],

	["input", function (this: HTMLInputElement, value: any) {
		this.value = value;
	}],

	["select", function (this: HTMLSelectElement, value: any) {
		this.value = value;
	}],

	["textarea", function (this: HTMLTextAreaElement, value: any) {
		this.value = value;
	}],

	["*", function (this: HTMLElement, value: any) {
		this.innerHTML = value;
	}]
];

const _pullers: [string, PullerFn][] = [
	["input[type='checkbox'], input[type='radio']", function (this: HTMLInputElement, existingValue: any) {

		const iptValue = this.value || "on"; // as some browser default to this
		let newValue;
		if (this.checked) {
			// change "on" by true value (which usually what we want to have)
			// TODO: We should test the attribute "value" to allow "on" if it is defined
			newValue = (iptValue && iptValue !== "on") ? iptValue : true;
			if (typeof existingValue !== "undefined") {
				// if we have an existingValue for this property, we create an array
				const values = asArray(existingValue);
				values.push(newValue);
				newValue = values;
			}
		}
		return newValue;
	}],

	["input, select", function (this: HTMLSelectElement, existingValue: any) {
		return this.value;
	}],

	["textarea", function (this: HTMLSelectElement, existingValue: any) {
		return this.value;
	}],

	["*", function (this: HTMLSelectElement, existingValue: any) {
		return this.innerHTML;
	}]
];

export function pusher(selector: string, pusherFn: (value: any) => void): void {
	_pushers.unshift([selector, pusherFn]);
}

export function puller(selector: string, pullerFn: () => any): void {
	_pullers.unshift([selector, pullerFn]);
}


export function push(el: HTMLElement | DocumentFragment, data: any): void;
export function push(el: HTMLElement | DocumentFragment, selector: string, data: any): void;
export function push(el: HTMLElement | DocumentFragment, selector_or_data: string | any, data?: any) {
	let selector;

	// if data is null or undefined
	if (data == null) {
		selector = ".dx";
		data = selector_or_data;
	} else {
		selector = selector_or_data;
	}

	const dxEls = all(el, selector);

	dxEls.forEach(function (dxEl) {

		const propPath = getPropPath(dxEl);

		// if we do not have a prop path, we skip this element
		if (!propPath) {
			return;
		}

		const value = val(data, propPath);

		if (typeof value !== 'undefined') {
			let i = 0, pusherSelector, fun, l = _pushers.length;
			for (; i < l; i++) {
				pusherSelector = _pushers[i][0];
				if (dxEl && dxEl.matches(pusherSelector)) {
					fun = _pushers[i][1];
					fun.call(dxEl, value);
					break;
				}
			}
		}

	});
}

export function pull(el: HTMLElement | DocumentFragment, selector?: string): any {
	const obj = {};

	selector = (selector) ? selector : ".dx";

	const dxEls = all(el, selector);

	dxEls.forEach(function (dxEl) {
		let propPath = getPropPath(dxEl);
		let i = 0, pullerSelector, fun, l = _pullers.length;
		for (; i < l; i++) {
			pullerSelector = _pullers[i][0];
			if (dxEl && dxEl.matches(pullerSelector)) {
				fun = _pullers[i][1];
				const existingValue = val(obj, propPath);
				const value = fun.call(dxEl, existingValue);
				if (typeof value !== "undefined") {
					val(obj, propPath, value);
				}
				break;
			}
		}
	});

	return obj;
}

/** 
 * Return the variable path of the first dx-. "-" is changed to "."
 * 
 * @param classAttr: like "row dx dx-contact.name"
 * @returns: will return "contact.name"
 **/
function getPropPath(dxEl: HTMLElement) {
	let path = null;
	let i = 0, classes = dxEl.classList, l = dxEl.classList.length, name;
	for (; i < l; i++) {
		name = classes[i];
		if (name.indexOf("dx-") === 0) {
			path = name.split("-").slice(1).join(".");
			break;
		}
	}
	// if we do not have a path in the css, try the data-dx attribute
	if (!path) {
		path = dxEl.getAttribute("data-dx");
	}
	if (!path) {
		// last fall back, assume input field or custom element with 'name' attribute
		path = dxEl.getAttribute("name");
	}
	return path;
}



