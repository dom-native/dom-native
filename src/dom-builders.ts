

//#region    ---------- elem ---------- 
type TagName = keyof HTMLElementTagNameMap;


/**
 * Shorthand for document.createElement(name)
 * 
 * Note: If name match a name in the HTMLElementTagNameMap type, it will return the appropriate type
 * So, `const el = elem('input'); // type returned is HTMLInputElement
 * But, `const el = elem('my-comp'); // type is HTMLElement (assuming HTMLElementTagNameMap namespace was not augmented with this tag name)
 */
export function elem<A extends string | TagName>(tagName: A): A extends TagName ? HTMLElementTagNameMap[A] : HTMLElement;

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
// NOTE: Using 'String' rather than 'string' in the typing above is critical to allow to get A[K] to match TagName type. 
//       Which will allow to correctly type `elem('input', 'un-known') // type[HTMLInputElement, HTMLElement]`
//       Otherwise, if use 'string', all A[K] will become "wider" and won't match to TagName, so all types are HTMLElement

export function elem(...names: string[]): HTMLElement | HTMLElement[] {
	if (names.length === 1) {
		return document.createElement(names[0]);
	} else {
		return names.map(n => { return document.createElement(n) });
	}
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