

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

/**
 * Create multiple HTMLElement via document.createElement
 * 
 * @param names tag names
 *
 * Note: If name match a name in the HTMLElementTagNameMap type, it will return the appropriate type
 * So, `const el = elem('input', 'canvas'); // type returned is [HTMLInputElement, HTMLCanvasElement]
 * But, `const el = elem('input', 'my-comp'); // type is [HTMLInputElement, HTMLElement] (assuming HTMLElementTagNameMap namespace was not augmented with this tag name)
 */
export function elem<A extends (TagName | String)[]>(...tagNames: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] : HTMLElement };

// Implementation Note: Using 'String' rather than 'string' in the typing above is critical to allow to get A[K] to match TagName type. 
//       Which will allow to correctly type `elem('input', 'un-known') // type[HTMLInputElement, HTMLElement]`
//       Otherwise, if use 'string', all A[K] will become "wider" and won't match to TagName, so all types are HTMLElement

export function elem(...args: any[]): HTMLElement | HTMLElement[] {
	const arg0Type = typeof args[0];
	const arg1Type = typeof args[1];

	// if we have a single element create
	if (arg0Type == 'string' && (arg1Type == 'object' || arg1Type == 'undefined')) {
		return createEl(args[0], args[1]);
	}
	// otherwise, have a list of tagNames (for now, do not support properties for list of tag name)
	else {
		return args.map(n => { return document.createElement(n) });
	}
}

// private function to create a el with some eventual properties. 
function createEl(tagName: string, data?: { [k: string]: string | Element | boolean | number | object }) {
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
				}
				// _textContent (to deprecate) - set the 
				// if _textContent then, it's the el.textContent ()
				else if (name == '_textContent') {
					el.textContent = valTxt;
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
 * NOTE: deprecated in favor of html
 * 
 * Returns a DocumentFragment for the html string. If html is null or undefined, returns an empty document fragment.
 * @param html the html string or null/undefined
 * @deprecated use html()
 */

export function frag(html: string | null | undefined) {
	// make it null proof
	html = (html) ? html.trim() : null;

	const template = document.createElement("template");
	if (html) {
		template.innerHTML = html;
	}
	return template.content;
}