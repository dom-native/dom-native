

//#region    ---------- elem ---------- 
type TagName = keyof HTMLElementTagNameMap;

type ElemData = {
	$?: { [k: string]: any },
} & {
	[k: string]: string | boolean | number | object // TODO: Needs to find a way to remove object from here
}

/**
 * Shorthand for document.createElement(name)
 * 
 * @param tagName - The tag name of the element to be created
 * @param data - The element attributes name:value to be set. 
 * 							 To set the properties, use `$` sub object. e.g., `$: {textContent: "Hello"}` will set the text content of the el.
 * 
 * Note: If name match a name in the HTMLElementTagNameMap type, it will return the appropriate type
 * 
 * So, `const el = elem('input'); // type returned is HTMLInputElement
 * But, `const el = elem('my-comp'); // type is HTMLElement (assuming HTMLElementTagNameMap namespace was not augmented with this tag name)
 */
export function elem<A extends string | TagName>(tagName: A, data?: ElemData): A extends TagName ? HTMLElementTagNameMap[A] : HTMLElement;

// private function to create a el with some eventual properties. 
export function elem(tagName: string, data?: { [k: string]: string | Element | boolean | number | object }) {
	let el = document.createElement(tagName);

	if (data != null) {
		for (const [name, rawVal] of Object.entries(data)) {
			// if it is a boolean, true will set the attribute empty, and false will set txtVal to null, which will remove it.
			const val = (typeof rawVal !== 'boolean') ? rawVal : (rawVal === true) ? '' : null;

			if (val !== null) {

				const valTxt = (typeof val == 'string') ? val : ('' + val);

				// "$" does a property assign of it's member
				if (name == '$') {
					const props = val;
					for (const [name, rawVal] of Object.entries(props)) {
						(<any>el)[name] = rawVal;
					}
				} else {
					el.setAttribute(name, valTxt);
				}

			}
			// if the value is null, we do nothing
		}
	}

	return el;
}
//#endregion ---------- /elem ----------

//#region    ---------- DocumentFragment builder ---------- 
/** Create a DocumentFragment from an HTML string (using template.innerHTML and returning template.content ) */
export function html(str: string): DocumentFragment
export function html(strings: TemplateStringsArray, ...values: any[]): DocumentFragment
export function html(strings: string | TemplateStringsArray, ...values: any[]) {

	let html: string | undefined;
	if (typeof strings === 'string') {
		html = strings.trim();
	} else {
		let r = '';
		for (let i = 0; i < strings.length; i++) {
			r += strings[i] + (values[i] ?? '');
		}
		// make it null proof
		html = r;
	}

	const template = document.createElement("template");
	if (html) {
		template.innerHTML = html;
	}
	return template.content;
}
//#endregion ---------- /DocumentFragment builder ---------- 


/**
 * Returns a DocumentFragment for the html string. If html is null or undefined, returns an empty document fragment.
 * @param html the html string or null/undefined
 */
export function frag(): DocumentFragment;
export function frag<T>(items: T[], acc: (item: T) => Element): DocumentFragment

export function frag<T>(items?: T[], acc?: (item: T) => Element): DocumentFragment {
	const frag = new DocumentFragment();
	if (items == null) { return frag }

	for (const item of items) {
		const el = acc!(item);
		frag.appendChild(el);
	}
	return frag;
}