/**
 * The platform touch slop, in pixels.
 *
 * A pan only activates past this distance. Anything smaller (we used to use 1)
 * lets finger jitter during a tap activate the pan, which cancels the touch on
 * whatever the user was actually pressing inside the modal.
 *
 * Shared so the gesture-handler surface and the Pointer Events surface agree on
 * when a press becomes a drag.
 */
export const TOUCH_SLOP = 10;
