

export function clamp(num: number, min: number, max: number) {
	return num <= min ? min : num >= max ? max : num;
}
export function findBelow(x: number, y: number, el?: HTMLElement) {
	if (el) el.style.visibility = 'hidden';
	const belowEl = document.elementFromPoint(x, y)! as HTMLElement;
	if (el) el.style.visibility = 'visible';
	return belowEl;
}

export type Transform = {
	scaleX?: number,
	skewY?: number,
	skewX?: number,
	scaleY?: number,
	translateX?: number,
	translateY?: number,
}


export function transform(el: HTMLElement): Transform {
	const matrix = window.getComputedStyle(el)
		.getPropertyValue("transform").match(/(-?[0-9\.]+)/g)
		?.map(str => Number(str));

	// matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )
	const [scaleX, skewY, skewX, scaleY, translateX, translateY] = matrix ?? [];
	return {
		scaleX,
		skewX,
		skewY,
		scaleY,
		translateX,
		translateY
	};
}

// NOTE: Do we need to use {passive:false} as for mobile as with touchmove to get evt.preventDefault() to work? 
//       see: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
