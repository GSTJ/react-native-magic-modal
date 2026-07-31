import type { Direction } from "../../constants/types";

/**
 * The browser chrome's motion primitives.
 *
 * Everything here is a plain value or a Web Animations API call. Reanimated's
 * `FadeIn*`/`FadeOut*` presets are reproduced rather than imported: the whole
 * point of the browser entry is that neither Reanimated nor Worklets reach it.
 * The numbers below are read off Reanimated 4's `defaultAnimations/Fade.ts`, so
 * a modal looks the same on web as it does on a device.
 */

/**
 * Reanimated's `Fade*Up|Down|Left|Right` presets travel 25px. Enter starts at
 * the offset and lands on zero; exit is the same offset in the same direction,
 * played the other way round.
 */
export const ENTER_OFFSET_IN_PX = 25;

/**
 * `Easing.inOut(Easing.quad)`, which is what `withTiming` uses when a layout
 * animation only sets `.duration()`. This is its standard cubic-bezier form.
 */
export const EASE_IN_OUT_QUAD = "cubic-bezier(0.455, 0.03, 0.515, 0.955)";

/**
 * Decelerating curve for the two swipe outcomes, standing in for the springs
 * the native chrome uses (`damping: 40, stiffness: 400` for the fling,
 * `damping: 75` for the return). Both are overdamped, so a decelerating ease
 * lands in the same place without the overshoot a spring would need.
 */
export const EASE_OUT_SWIPE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** How long a released, under-threshold drag takes to settle back. */
export const SWIPE_RETURN_DURATION_IN_MS = 220;

const offsetMap = {
  up: { x: 0, y: -ENTER_OFFSET_IN_PX },
  down: { x: 0, y: ENTER_OFFSET_IN_PX },
  left: { x: -ENTER_OFFSET_IN_PX, y: 0 },
  right: { x: ENTER_OFFSET_IN_PX, y: 0 },
} satisfies Record<Direction, { x: number; y: number }>;

export const translate3d = ({ x, y }: { x: number; y: number }) =>
  `translate3d(${x}px, ${y}px, 0)`;

const restingTransform = translate3d({ x: 0, y: 0 });

export const getContentEnterKeyframes = (direction: Direction) => [
  { opacity: 0, transform: translate3d(offsetMap[direction]) },
  { opacity: 1, transform: restingTransform },
];

export const getContentExitKeyframes = (direction: Direction) => [
  { opacity: 1, transform: restingTransform },
  { opacity: 0, transform: translate3d(offsetMap[direction]) },
];

export const getFadeKeyframes = (from: number, to: number) => [
  { opacity: from },
  { opacity: to },
];

/**
 * The backdrop tracks the drag: fully opaque at rest, fully clear once the
 * modal has travelled a whole screen. Mirrors the native chrome's
 * `interpolate(translation, [range, 0], [0, 1], CLAMP)`.
 */
export const getBackdropOpacity = ({
  range,
  translation,
}: {
  range: number;
  translation: number;
}) => {
  if (range === 0) {
    return 1;
  }

  const progress = 1 - translation / range;

  return Math.min(1, Math.max(0, progress));
};

export type WebAnimationHandle = {
  cancel: () => void;
  finished: Promise<void>;
};

const noopAnimation: WebAnimationHandle = {
  cancel: () => {},
  finished: Promise.resolve(),
};

/**
 * Plays `keyframes` on `node` and resolves when it settles.
 *
 * Falls back to landing on the final keyframe immediately wherever
 * `Element.animate` is missing — server rendering, jsdom, and the handful of
 * browsers without the Web Animations API. Callers get the same promise
 * either way, so a missing WAAPI costs the animation and nothing else.
 */
export const runWebAnimation = (
  node: HTMLElement | null,
  keyframes: Keyframe[],
  {
    duration,
    easing = EASE_IN_OUT_QUAD,
  }: { duration: number; easing?: string },
): WebAnimationHandle => {
  if (!node) {
    return noopAnimation;
  }

  if (typeof node.animate !== "function") {
    applyStyle(node, keyframes.at(-1));
    return noopAnimation;
  }

  const animation = node.animate(keyframes, {
    duration,
    easing,
    fill: "both",
  });

  return {
    cancel: () => {
      animation.cancel();
    },
    // `Animation.finished` rejects with an AbortError when something cancels
    // it, which is a normal outcome here: an exit interrupts an enter.
    finished: animation.finished.then(
      () => {},
      () => {},
    ),
  };
};

export const applyStyle = (
  node: HTMLElement | null,
  style: Keyframe | undefined,
) => {
  if (!node || !style) {
    return;
  }

  if (typeof style.opacity === "number") {
    node.style.opacity = String(style.opacity);
  }

  if (typeof style.transform === "string") {
    node.style.transform = style.transform;
  }
};

/**
 * Animates, then hands the final values back to the inline style.
 *
 * `fill: "both"` keeps a finished animation's effect on top of anything written
 * to `node.style`, which would freeze out the next drag. Writing the inline
 * style before cancelling means the value never changes, so there is no flash
 * between the two.
 */
export const animateAndCommit = async (
  node: HTMLElement | null,
  keyframes: Keyframe[],
  options: { duration: number; easing?: string },
) => {
  const animation = runWebAnimation(node, keyframes, options);

  await animation.finished;
  applyStyle(node, keyframes.at(-1));
  animation.cancel();
};
