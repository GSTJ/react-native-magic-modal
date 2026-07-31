import { MagicModal } from "../magic-modal";
import { FullWindowOverlay } from "./full-window-overlay";
import { createMagicModalPortal } from "./magic-modal-portal-base";

/**
 * Portal for the native iOS and Android runtime.
 *
 * Mount exactly one portal at the application root. On iOS it can use
 * react-native-screens' FullWindowOverlay to render above native modal screens.
 *
 * The Reanimated chrome has no exit animation, so a dismissed entry leaves the
 * stack immediately — the default `leaveStack`.
 */
export const MagicModalPortal = createMagicModalPortal({
  FullWindowOverlay,
  StackEntry: MagicModal,
});
