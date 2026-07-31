import { MagicModal } from "../magic-modal";
import { FullWindowOverlay } from "./full-window-overlay.browser";
import { createMagicModalPortal } from "./magic-modal-portal-base";

/**
 * Browser portal. FullWindowOverlay is a fragment here because it is an
 * iOS-only capability.
 */
export const MagicModalPortal = createMagicModalPortal({
  FullWindowOverlay,
  StackEntry: MagicModal,
});
