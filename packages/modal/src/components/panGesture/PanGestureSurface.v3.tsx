import React, { useMemo } from "react";
import { GestureDetector } from "react-native-gesture-handler";

import type { PanGestureConfigCompat } from "./gestureHandlerCompat";
import type { PanGestureSurfaceProps } from "./PanGestureSurface.types";
import { usePanGestureCompat } from "./gestureHandlerCompat";

/**
 * Swipe surface for gesture-handler 3.x, built on the `usePanGesture` hook.
 *
 * `usePanGesture` memoizes on the identity of the config object it is handed
 * and re-pushes the whole config to the native side whenever that identity
 * changes. Building the object inline would do that on every render, so it is
 * memoized on the spec, which `MagicModal` already keeps stable.
 */
export const PanGestureSurfaceV3 = ({
  swipe,
  children,
}: PanGestureSurfaceProps) => {
  const panConfig = useMemo<PanGestureConfigCompat>(
    () => ({
      enabled: swipe.enabled,
      minDistance: swipe.minDistance,
      onActivate: swipe.onStart,
      onUpdate: swipe.onUpdate,
      // `onDeactivate` is wired to `CALLBACK_TYPE.END`, which is what 2.x's
      // `.onEnd` registered, so SWIPE_COMPLETE resolves at the same point in
      // the gesture lifecycle on both majors. `onFinalize` would additionally
      // run after gestures that never activated.
      onDeactivate: swipe.onEnd,
    }),
    [swipe],
  );

  const pan = usePanGestureCompat(panConfig);

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
};
