import { BaseHTMLElement, customElement, elem, first, frag, hub, onEvent, onHub } from '#dom-native';
import { equal } from './utils';

let out: string[] = [];

// TODO: Chose finish the test

@customElement('dev-el')
class DevEl extends BaseHTMLElement {
	@onEvent('click')
	onClickEvent() {
		out.push('dev-el @onEvent onClickEvent');
	}

	@onHub("data", "agent")
	onHubDataAgent(evt: any) {
		out.push("dev-el onHubDataAgent");
	}

	postDisplay() {
		if (this.textContent == "aaa") {
			this.textContent = "aaa 111";
		}
	}
}

@customElement('dev-el2')
class DevEl2 extends DevEl {
	// Here we are overriding the parent onClickEvent, so, the parent function should be ignored.
	@onEvent('pointerdown')
	onClickEvent() {
		out.push('DevEl2 @onEvent pointerdown');
	}

	@onHub("data", "agent")
	onHubDataAgent(evt: any) {
		out.push("dev-el2 onHubDataAgent");
	}
}

export function _beforeEach() {
	out = [];
}


export function testOnEvent() {
	let el = first("dev-el")!;
	el.click();

	let el2 = first("dev-el2");
	let event = new PointerEvent('pointerdown', {
		bubbles: true,
		cancelable: true,
	});
	el2?.dispatchEvent(event);
	equal(['dev-el @onEvent onClickEvent', 'DevEl2 @onEvent pointerdown'], out);
}


export function testOnHub() {
	hub("data").pub("agent", "some message");
	equal(['dev-el onHubDataAgent', 'dev-el2 onHubDataAgent', 'dev-el2 onHubDataAgent'], out);
}



