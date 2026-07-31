import type { Direction } from "../../constants/types";

/**
 * Swipe-to-dismiss arithmetic for the browser chrome, with no DOM in sight.
 *
 * The native chrome runs the same rules inside Reanimated worklets driven by
 * gesture-handler. Keeping them here as plain functions is what lets the web
 * path drop gesture-handler without the two behaviours drifting: damping, the
 * activation slop, and the velocity test are all decided by the same
 * expressions, and this module is what the unit tests exercise.
 */

export type SwipePoint = { x: number; y: number };

export type SwipeSample = SwipePoint & { time: number };

export type SwipeDragState = {
  /** True once the pointer has travelled past the slop and owns the drag. */
  isActive: boolean;
  origin: SwipeSample;
  /** Where the modal already sat when this drag started. */
  previous: SwipePoint;
  /** Recent positions, newest last, used to estimate release velocity. */
  samples: SwipeSample[];
  translation: SwipePoint;
};

export type SwipeDragConfig = {
  dampingFactor: number;
  direction: Direction;
  minDistance: number;
};

/**
 * How far back the release velocity looks. Long enough to survive a couple of
 * jittery frames, short enough that a drag which stalled before release reads
 * as slow — which is what a user who stopped moving means by it.
 */
const VELOCITY_WINDOW_IN_MS = 100;

export const isHorizontalDirection = (direction: Direction) =>
  direction === "left" || direction === "right";

export const beginSwipeDrag = ({
  point,
  previous,
  time,
}: {
  point: SwipePoint;
  previous: SwipePoint;
  time: number;
}): SwipeDragState => {
  const origin = { ...point, time };

  return {
    isActive: false,
    origin,
    previous,
    samples: [origin],
    translation: previous,
  };
};

const recordSample = (samples: SwipeSample[], sample: SwipeSample) =>
  [...samples, sample].filter(
    (candidate, index, all) =>
      // Always keep the newest sample, plus everything inside the window.
      index === all.length - 1 ||
      sample.time - candidate.time <= VELOCITY_WINDOW_IN_MS,
  );

export const updateSwipeDrag = (
  state: SwipeDragState,
  {
    dampingFactor,
    direction,
    minDistance,
    point,
    time,
  }: SwipeDragConfig & { point: SwipePoint; time: number },
): SwipeDragState => {
  const samples = recordSample(state.samples, { ...point, time });
  const rawX = point.x - state.origin.x;
  const rawY = point.y - state.origin.y;
  const isActive = state.isActive || Math.hypot(rawX, rawY) >= minDistance;

  if (!isActive) {
    return { ...state, samples };
  }

  const isHorizontal = isHorizontalDirection(direction);
  const raw = isHorizontal ? rawX : rawY;

  // Dragging against the dismissal direction is resisted rather than blocked,
  // so the modal still gives under the finger.
  const shouldDampMap = {
    up: raw > 0,
    down: raw < 0,
    left: raw > 0,
    right: raw < 0,
  } satisfies Record<Direction, boolean>;

  const previousOnAxis = isHorizontal ? state.previous.x : state.previous.y;
  const damped =
    previousOnAxis + (shouldDampMap[direction] ? raw * dampingFactor : raw);

  return {
    ...state,
    isActive: true,
    samples,
    translation: isHorizontal
      ? { x: damped, y: state.previous.y }
      : { x: state.previous.x, y: damped },
  };
};

/** Pixels per second, matching what gesture-handler reports on native. */
export const getSwipeVelocity = (samples: SwipeSample[]): SwipePoint => {
  const newest = samples.at(-1);
  const [oldest] = samples;

  if (!newest || !oldest || newest.time === oldest.time) {
    return { x: 0, y: 0 };
  }

  const elapsedInSeconds = (newest.time - oldest.time) / 1000;

  return {
    x: (newest.x - oldest.x) / elapsedInSeconds,
    y: (newest.y - oldest.y) / elapsedInSeconds,
  };
};

export const endSwipeDrag = (
  state: SwipeDragState,
  {
    direction,
    velocityThreshold,
  }: { direction: Direction; velocityThreshold: number },
): { shouldDismiss: boolean; velocity: SwipePoint } => {
  const velocity = getSwipeVelocity(state.samples);

  // The same velocity-only test the native chrome applies. Distance never
  // enters into it there, so it does not here either: a slow drag across the
  // whole screen springs back on both.
  const shouldDismissMap = {
    up: velocity.y < -velocityThreshold,
    down: velocity.y > velocityThreshold,
    left: velocity.x < -velocityThreshold,
    right: velocity.x > velocityThreshold,
  } satisfies Record<Direction, boolean>;

  return {
    shouldDismiss: state.isActive && shouldDismissMap[direction],
    velocity,
  };
};

/**
 * Where the modal has to land to be off screen, per direction. Mirrors the
 * native chrome's `rangeMap`.
 */
export const getSwipeRange = ({
  direction,
  height,
  width,
}: {
  direction: Direction;
  height: number;
  width: number;
}) =>
  ({
    up: -height,
    down: height,
    left: -width,
    right: width,
  })[direction];

/**
 * What the element should let the browser keep handling while a swipe is
 * armed. Claiming only the dismissal axis leaves the other one to native
 * scrolling, which `touch-action: none` would take away for no reason.
 */
export const getSwipeTouchAction = (direction: Direction | undefined) => {
  if (!direction) {
    return "";
  }

  return isHorizontalDirection(direction) ? "pan-y" : "pan-x";
};
