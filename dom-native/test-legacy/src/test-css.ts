import { adoptStyleSheets, append, BaseHTMLElement, css, customElement, first } from '#dom-native';
import { contains, equal } from './utils';


const shadowStyleCss = css`
	:host {
		display: inline-block;
		border: solid 1px blue;
		padding: 1rem;
	}
	strong { color: red}
`;


@customElement('shadow-style')
class ShadowStyle extends BaseHTMLElement {
	constructor() {
		super();
		adoptStyleSheets(this.attachShadow({ mode: 'open' }), shadowStyleCss).innerHTML = '<strong>hello</strong> world';
	}
}


export function testAdoptStyleSheet() {
	const contentEl = first('.test-content')!;
	append(contentEl, '<shadow-style></shadow-style>');

}


export function testTagSimple() {
	const obj = css`span.col{ border: solid 1px red}`;
	equal(obj.text, 'span.col{ border: solid 1px red}');
}


export function testTagWithVal() {
	const v = 'red';
	const obj = css`span.col{ border: solid 1px ${v}}`;
	equal(obj.text, 'span.col{ border: solid 1px red}');
}



export function testTagWithNull() {
	const v = null;
	const obj = css`span.col{ border: solid 1px ${v}}`;
	equal(obj.text, 'span.col{ border: solid 1px null}');
}

export function testTagWithUndefined() {
	const v = undefined;
	const obj = css`span.col{ border: solid 1px ${v}}`;
	equal(obj.text, 'span.col{ border: solid 1px undefined}');
}


export function testTagWithNested() {
	const v = undefined;
	const color = 'black';

	const obj = css`
		span.col{ border: solid 1px ${v}; }
		${css`
		div.panel{ background: ${color}}
		`}
	`;

	contains(obj.text, 'black');
}

export function testTagEmpty() {

	const obj = css``;

	equal('', obj.text);
}


export function testCssFnSimple() {
	const obj = css(`span.col{ border: solid 1px red}`);
	equal(obj.text, 'span.col{ border: solid 1px red}');
}


export function testStyle() {
	const style = css`span.col{ border: solid 1px red}`.newStyle;
	equal(style.innerHTML, 'span.col{ border: solid 1px red}');
}