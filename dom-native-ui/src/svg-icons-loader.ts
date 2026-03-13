import { html } from 'dom-native';
import { SVG_SYMBOLS as SVG_SYMBOLS_DEFAULT } from "./svg-icons-symbols-default.js";

export function loadDefaultIcons() {
	loadSvgSymbols(SVG_SYMBOLS_DEFAULT);
}

export function loadSvgSymbols(svgStr: string) {
	if (document.readyState === "complete"
		|| document.readyState === "interactive") {
		inject_svg(svgStr)
	} else {
		document.addEventListener("DOMContentLoaded", async (event) => {
			inject_svg(svgStr)
		});
	}
}

function inject_svg(svg_str: string) {
	let svgEl = html(svg_str).firstElementChild!;
	// in case the dom engine move it to body
	svgEl.setAttribute('style', 'display: none');
	document.head.append(svgEl);
}