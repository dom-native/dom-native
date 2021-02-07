/**
 * Anim callback function.
 * @param ntime normalized time (0 to 1). Value might be eased if a ease function was provided.
 * @param raftime the requestAnimationFrame time (relative to raf first start time)
 * @returns if callback returns false, it will end the callbacks regardless of the remaining time.
 */

export type AnimCallback = (ntime: number, raftime: number) => void | boolean;

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
 * @param ease Optional ease function (take the linear normalized time)
 *
 * @returns Promise<void>, which resolve with the raftime of the last frame.
 */
export function anim(callback: AnimCallback, duration: number, ease?: (linearTime: number) => number): Promise<void> {

  return new Promise<void>((res, rej) => {
    requestAnimationFrame((rstart) => {
      // capture the start raf time
      const rafStart = rstart;

      // start the callbacks
      callNext(rafStart);

      function callNext(rtime: number) {
        const rafTime = rtime; // current raf time

        //// Compute the ntime
        // absolute time from the start of the animation
        const deltaTime = rafTime - rafStart;
        // Note: the last deltaTime will likely be a little higher than the target duration
        const last = deltaTime >= duration;
        const linearTime = last ? 1 : deltaTime / duration;
        const ntime = ease ? ease(linearTime) : linearTime;

        //// Call the callback
        try {
          // perform the callback
          const r = callback(ntime, rafTime);

          // determine if the callback wants the animation to stop
          const stopped = r === false;

          // if it is last frame or been stopped, resolve the promise
          if (last || stopped) {
            res();
          }
          // otherwise, we schedule a callNext for the next request animation frame
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
