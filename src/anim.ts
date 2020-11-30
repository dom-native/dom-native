
/**
 * Anim callback function. 
 * @param ntime normalized time (0 to 1) and eased if a ease function was provided.
 * @param raftime the requestAnimationFrame time (relative to raf first start time)
 */

type AnimCallback = (ntime: number, raftime: number) => void | boolean;

/**
 * Execute the function fn on each requestAnimationFrame with the normalized time as argument [0..1] based on the duration 
 * and eventual easing.
 * 
 * Note 1: This used the requestAnimationFrame timestamp, to allow animations synchronization.
 * 
 * Note 2: dom-native does not provide any easing method. d3-ease are a good source of easings.
 * 
 * @param callback function to be callback on each animation frame with the normalized time.
 * @param duration Duration of the animation. Will be used at the time basis for the normalization.
 * @param ease Optional ease function
 * 
 * @returns Promise<void>, which resolve when animation ends or callback return false. 
 */
export function anim(callback: AnimCallback, duration: number, ease?: (normTime: number) => number): Promise<void> {
	return new Promise((res, rej) => {

		requestAnimationFrame(st => {
			const startRafTime = st;

			drawNext(st);

			function drawNext(raftime: number) {
				let done = false;
				const normTime = (raftime - startRafTime) / duration;
				let ntime = normTime; // computed normalized time

				if (raftime - startRafTime > duration) {
					ntime = 1;
					done = true;
				} else if (ease) {
					ntime = (ease) ? ease(normTime) : normTime;
				}

				try {
					const r = callback(ntime, raftime);

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