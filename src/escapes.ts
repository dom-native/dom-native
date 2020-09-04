

const _elHtml = document.createElement('div');
export function escapeHtml(txt: string) {
	_elHtml.textContent = txt;
	const safeTxt = _elHtml.innerHTML;
	_elHtml.textContent = null;
	return safeTxt;
}

const _elAttr = document.createElement('e');
export function escapeAttr(txt: string) {
	_elAttr.setAttribute('a', txt);
	// .outerHTML will generate something like '<e a="..."></e>';
	const html = _elAttr.outerHTML;
	const safeTxt = html.substring(6, html.length - 6);
	_elHtml.setAttribute('a', '');
	return safeTxt;
}

