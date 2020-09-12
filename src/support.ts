


// inspired from https://github.com/Polymer/lit-element/blob/master/src/lib/css-tag.ts
export const supportsAdoptingStyleSheets = (window.ShadowRoot) &&
	('adoptedStyleSheets' in Document.prototype)
	&& ('replaceSync' in CSSStyleSheet.prototype);