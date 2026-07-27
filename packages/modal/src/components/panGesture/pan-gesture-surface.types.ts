/**
 * The event fields the swipe worklets read, and nothing else. Both
 * gesture-handler majors hand their pan callbacks an event carrying these, so
 * typing the worklets this narrowly lets one set of them drive either API.
 */
export interface SwipeTranslationEvent {
  translationX: number;
  translationY: number;
}

export interface SwipeVelocityEvent {
  velocityX: number;
  velocityY: number;
}

/**
 * What `MagicModal` needs from a pan gesture, spelled out independently of
 * gesture-handler's major version.
 *
 * The callback names follow gesture-handler 2.x's builder, and each surface
 * maps them to its own API. The mapping is `onStart` -> 3.x `onActivate`,
 * `onUpdate` -> 3.x `onUpdate`, `onEnd` -> 3.x `onDeactivate`. Nothing maps to
 * `onFinalize` or `onBegin`: both also run for gestures that never activated,
 * so hanging the dismissal off either would fire it on taps that failed the
 * slop check.
 */
export interface SwipeGestureSpec {
  enabled: boolean;
  minDistance: number;
  onStart: () => void;
  onUpdate: (event: SwipeTranslationEvent) => void;
  onEnd: (event: SwipeVelocityEvent) => void;
}

export interface PanGestureSurfaceProps {
  swipe: SwipeGestureSpec;
  children: React.ReactNode;
}
