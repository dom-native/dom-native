
/**
 * Anim callback function. 
 * @param ntime normalized time (0 to 1) and eased if a ease function was provided.
 * @param raftime the requestAnimationFrame time (relative to raf first start time)
 * @returns if callback returns false, it will end the callbacks regardless of the remaining time.
 */

type AnimCallback = (ntime: number, raftime: number) => void | boolean;

/**
 * Execute the callback on each requestAnimationFrame with the normalized time as argument [0..1] based on the duration 
 * and eventual easing.
 * 
 * Note 1: This use the requestAnimationFrame timestamp, to allow animations synchronization.
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
			// on first requestAnimationFrame, capture the reference startTime
			const startRafTime = st;

			// start the callbacks
			callNext(st);

			function callNext(raftime: number) {
				let done = false;

				// compute the normTime from the start time and duration
				const normTime = (raftime - startRafTime) / duration;
				let ntime = normTime; // computed normalized time

				// if passed duration, set ntime to 1 and make it last call
				if (raftime - startRafTime >= duration) {
					ntime = 1;
					done = true;
				}
				// otherwise, if we have a ease, we update the ntime
				else if (ease) {
					ntime = ease(normTime);
				}

				try {
					// perform the callback
					const r = callback(ntime, raftime);

					// if the callback returns false, make it last call
					if (r === false) {
						done = true;
					}

					// if done, we resolve the promise
					if (done) {
						res();
					}
					// otehrwise, we schedule a callNext for the next request animation frame
					else {
						requestAnimationFrame(callNext);
					}

				} catch (ex) {
					rej(ex);
				}

			}
		});

	});

}