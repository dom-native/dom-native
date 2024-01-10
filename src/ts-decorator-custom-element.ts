
// Note: New TS 5.x decorators
export function customElement(tagName: string) {
	// target references the element's class. 
	return function (target: any, context: ClassDecoratorContext) {
		customElements.define(tagName, target);
	}
}