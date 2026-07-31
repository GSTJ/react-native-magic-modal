import type { ModalStackLeave } from "./magic-modal-portal-base";

import { MagicModal } from "../magic-modal.browser";
import { FullWindowOverlay } from "./full-window-overlay.browser";
import { createMagicModalPortal } from "./magic-modal-portal-base";

/**
 * Keeps a dismissed entry mounted so its exit animation has something to play
 * on. `MagicModal` calls `onExitFinished` when the animation settles, and that
 * is what finally drops it.
 *
 * Marking rather than removing is what makes the exit possible at all: React
 * gives an unmounted component no frames.
 */
const markExiting: ModalStackLeave = (modals, leaving) =>
  modals.map((modal) =>
    modal.id === leaving.id ? { ...modal, isExiting: true } : modal,
  );

/**
 * Browser portal. FullWindowOverlay is a fragment here because it is an
 * iOS-only capability, and the chrome is the Web Animations API one, so
 * nothing in this graph reaches Reanimated, gesture-handler or Worklets.
 */
export const MagicModalPortal = createMagicModalPortal({
  FullWindowOverlay,
  StackEntry: MagicModal,
  leaveStack: markExiting,
});
