import { FullWindowOverlay } from "./full-window-overlay";
import { createMagicModalPortal } from "./magic-modal-portal-base";

/**
 * Portal for the native iOS and Android runtime.
 *
 * Mount exactly one portal at the application root. On iOS it can use
 * react-native-screens' FullWindowOverlay to render above native modal screens.
 */
export const MagicModalPortal = createMagicModalPortal(FullWindowOverlay);
