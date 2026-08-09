

export function capture(els: HTMLElement[]) {

	const originRects: DOMRect[] = els.map(el => el.getBoundingClientRect());

	return function invert() {

		// NOTE: At this point, we assume the els are at the target destination
		for (let i = 0; i < els.length; i++) {
			const originRect = originRects[i];
			const el = els[i];
			const rect = el.getBoundingClientRect();
			el.style.transform = `translate(${originRect.left - rect.left}px, ${originRect.top - rect.top}px)`
		}

		return function play(duration = 500) {
			return new Promise((res: Function, rej) => {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						for (const el of els) {
							el.style.transform = 'translate(0px, 0px)';
							el.style.transitionDuration = `${duration}ms`;
						}

						function cleanup() {
							for (const el of els) {
								el.style.transform = '';
								el.style.transitionDuration = '';
							}
							res();
						}

						// Note 1: using timeout to avoid to monitor each elements' transitionend (with 50ms padding, should take care of 90%+ cases)
						// Note 2: will eventually provide an option to schedule cleanup
						setTimeout(cleanup, duration + 50);
					});
				});
			});
		}

	}

}