

/**
 * Execute the function fn on each requestAnimationFrame with the normalized time as argument [0..1] based on the duration 
 * and eventual easing.
 * 
 * Note 1: This used the requestAnimationFrame timestamp, to allow animations synchronization.
 * 
 * Note 2: dom-native does not provide any easing method. d3-ease are a good source of easings.
 * 
 * @param callback function to be called on each requestAnimationFrame, the normalized time (0 to 1) as argument. Eased if ease function was provided. 
 * @param duration Duration of the animation. Will be used at the time basis for the normalization.
 * @param ease Optional ease function
 * 
 * @returns if callback return false, the animation is stopped (i.e. the fn is not called anymore)
 */
export function anim(callback: (ntime: number) => void | boolean, duration: number, ease?: (normTime: number) => number) {
	return new Promise((res, rej) => {

		requestAnimationFrame(st => {
			const start = st;

			drawNext(st);

			function drawNext(elaps: number) {
				let done = false;
				const normTime = (elaps - start) / duration;
				let ntime = normTime; // computed normalized time

				if (elaps - start > duration) {
					ntime = 1;
					done = true;
				} else if (ease) {
					ntime = (ease) ? ease(normTime) : normTime;
				}

				try {
					const r = callback(ntime);

					if (r === false) {
						done = true;
					}

					if (done) {
						res();
					} else {
						requestAnimationFrame(drawNext);
					}

				} catch (ex) {
					rej(ex);
				}

			}
		});

	});

}