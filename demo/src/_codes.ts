

export const code_simpleElement	= `
// BaseHTMLElement is a simple class extending DOM HTMLElement
//                 with minimum but expressive lifecycle with 
//                 init, preDisplay, postDisplay, and event bindings
class SimpleElement extends BaseHTMLElement {
	// will be called only once, on first connectedCallback
	init() {
		this.innerHTML = '!!! Hello from SimpleElement !!!';
	}
}
customElements.define('simple-element', SimpleElement);
`;

		

export const code_simpleElement2	= `
@customElement('simple-element-2') // dom-native provide this ts decorator
class SimpleElement2 extends BaseHTMLElement {
	private _mode?: 'warning' | 'info';
	set mode(m: 'warning' | 'info') {
		this._mode = m;
		this.style.background = (m == 'warning') ? 'yellow' : (m == 'info') ? '#DDDDFF' : '#FFF';
	};

	init() {
		this.innerHTML = 'Simple @customElement decorator'
	}

	// before the first paint (allows to further intialize the element with eventual data added after the parentEl.append )
	preDisplay() {
		this.innerHTML += ' - mode: ' + this._mode;
	}
}
`;

		

export const code_shadowSimple	= `
@customElement('shadow-simple')
class ShadowSimple extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.innerHTML = \`
<style>
:host h3{ 
	display: inline; 
	color: red; 
	font-size: 1rem;
}
</style>

Hello from <h3>ShadowSimple</h3> constructor

		\`;
	}
}
`;

		

export const code_shadowPart	= `
@customElement('shadow-part')
class ShadowPart extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.innerHTML = \`
<style>
/* basic style for h3, which can be overriden with css-part */
h3 { 
	display: inline; 
	color: red; 
	font-size: 1rem;
}
</style>

Hello from <h3 part="label">ShadowPart</h3> constructor

		\`;
	}
}
`;

		

export const code_shadowSlot	= `
// This will create Template and return its .content, which could be cloned (shadow.innerHTML alternative)
const shadowSlotTmpl = frag(\`
<style>
::slotted(h3){
	display: inline; 
	font-size: 1rem;
	padding: 0 1rem;
	color: blue;
	border: solid 1px #ddd;
	margin: 0 .5rem;
}
</style>

Hello from <slot>placeholder</slot> constructor

\`)

@customElement('shadow-slot')
class ShadowSlot extends BaseHTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.append(shadowSlotTmpl.cloneNode(true));
	}
}
`;

		