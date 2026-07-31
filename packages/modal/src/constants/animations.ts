export const ANIMATION_DURATION_IN_MS = 250;

/**
 * Extra time the iOS FullWindowOverlay stays mounted after the last modal
 * leaves the stack.
 *
 * A stack entry is dropped from state as soon as it is hidden, while its
 * Reanimated `exiting` animation keeps playing on the UI thread. Reanimated
 * does not bridge a completion callback back to JS for layout animations, so
 * the overlay unmount is timed off the entry's `animationOutTiming` plus this
 * margin instead of being observed.
 */
export const OVERLAY_UNMOUNT_GRACE_IN_MS = 50;
