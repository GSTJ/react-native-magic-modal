import type { ModalStackLeave } from "./magic-modal-portal-base";

import { MagicModal } from "../magic-modal.browser";
import {
  FullWindowOverlay,
  isFullWindowOverlaySupported,
} from "./full-window-overlay.browser";
import { createMagicModalPortal } from "./magic-modal-portal-base";
import { PortalContainer } from "./portal-container.browser";
import { subscribeToSystemBack } from "./system-back.browser";

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
 * Browser portal. Every piece the platform decides is the DOM one here: plain
 * elements for the container, no full-window overlay, no hardware back button,
 * and the Web Animations API chrome. Nothing in this graph reaches
 * react-native, react-native-web, Reanimated, gesture-handler or Worklets.
 */
export const MagicModalPortal = createMagicModalPortal({
  FullWindowOverlay,
  isFullWindowOverlaySupported,
  PortalContainer,
  StackEntry: MagicModal,
  leaveStack: markExiting,
  subscribeToSystemBack,
});
