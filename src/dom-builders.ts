

//#region    ---------- elem ---------- 
/**
 * Shorthand for document.createElement(name)
 * @param name tag name 
 */
export function elem(name: string): HTMLElement;

/**
 * Create multiple HTMLElement via document.createElement
 * @param names tag names
 */
export function elem(...names: string[]): HTMLElement[];
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
 * NOTE: might become deprecated in favor of html
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