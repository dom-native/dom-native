

const _elHtml = document.createElement('div');
/** Shortname for escapeHtml */
export const xh = escapeHtml;
/** Escape a HTML content using native DOM textContent to innerHTML capability */
export function escapeHtml(txt: string) {
	_elHtml.textContent = txt;
	const safeTxt = _elHtml.innerHTML;
	_elHtml.textContent = null;
	return safeTxt;
}

const _elAttr = document.createElement('e');
/** Shortname for escapeAttr */
export const xa = escapeAttr;
/** Escape a string as a HTML Attribute content using native DOM attribute serialization */
export function escapeAttr(txt: string) {
	_elAttr.setAttribute('a', txt);
	// .outerHTML will generate '<e a="..."></e>';
	const html = _elAttr.outerHTML;
	const safeTxt = html.substring(6, html.length - 6);
	_elHtml.setAttribute('a', '');
	return safeTxt;
}

