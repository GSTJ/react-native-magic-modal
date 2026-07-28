import { hasPanGestureHook } from "./gesture-handler-compat";
import { PanGestureSurfaceV2 } from "./pan-gesture-surface.v2";
import { PanGestureSurfaceV3 } from "./pan-gesture-surface.v3";

export type {
  PanGestureSurfaceProps,
  SwipeGestureSpec,
} from "./pan-gesture-surface.types";

/**
 * The swipe surface for the installed gesture-handler.
 *
 * 3.x replaced the `Gesture.Pan()` builder with the `usePanGesture` hook. The
 * peer range spans both majors because Expo's SDK pin trails gesture-handler's
 * latest, so both have to work.
 *
 * Picking the component here rather than branching inside one keeps hook order
 * stable: `hasPanGestureHook` is decided once when this module first loads and
 * cannot change afterwards, so React always sees the same component type. A
 * branch inside a single component would mean calling `usePanGesture`
 * conditionally.
 */
export const PanGestureSurface = hasPanGestureHook
  ? PanGestureSurfaceV3
  : PanGestureSurfaceV2;
