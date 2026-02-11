

export function customElement(tagName: string) {
	// target references the element's class. 
	return function (target: any) {
		customElements.define(tagName, target);
	}
}