import type { SystemBackSubscription } from "./magic-modal-portal-base";

/**
 * A browser has no hardware back button. Its system dismissal is Escape, which
 * the chrome's focus trap handles on the topmost dialog, and browser navigation
 * deliberately does not close a modal.
 */
export const subscribeToSystemBack: SystemBackSubscription = () => () => {};
