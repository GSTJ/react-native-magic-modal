import type { Direction } from "../constants/types";

import React from "react";
import { Text } from "react-native";

import { act, render as rntlRender } from "@testing-library/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { magicModal } from "../utils/magic-modal-handler";
import { MagicModalPortal } from "./MagicModalPortal/magic-modal-portal";

/**
 * Scaffolding shared by `magic-modal.swipe.v2.test.tsx` and
 * `magic-modal.swipe.v3.test.tsx`.
 *
 * MagicModal wires the swipe up through gesture-handler 2.x's `Gesture.Pan()`
 * builder or 3.x's `usePanGesture` hook, whichever the installed major has, so
 * each gets its own suite. Only the interception differs. Keeping everything
 * around it here is what makes the two suites comparable line by line.
 *
 * Not picked up as a suite itself: jest's testMatch only takes `*.test.tsx`.
 */

const content = "Taveira";

export const ModalContent = () => <Text testID="swipe-content">{content}</Text>;

export const directions = ["up", "down", "left", "right"] as const;

/**
 * Matches `TOUCH_SLOP` in `MagicModal.tsx`. Both surfaces have to forward it:
 * without it, finger jitter during a tap activates the pan and cancels the
 * touch on whatever the user was pressing inside the modal.
 */
export const expectedMinDistance = 10;

interface PanVelocity {
  velocityX: number;
  velocityY: number;
}

/** Clears the default `swipeVelocityThreshold` by a wide margin. */
export const fastVelocity = {
  up: { velocityX: 0, velocityY: -900 },
  down: { velocityX: 0, velocityY: 900 },
  left: { velocityX: -900, velocityY: 0 },
  right: { velocityX: 900, velocityY: 0 },
} satisfies Record<Direction, PanVelocity>;

/** Under the threshold in every direction, so the modal springs back. */
export const slowVelocity: PanVelocity = { velocityX: 10, velocityY: 10 };

/**
 * Every field either major's pan event carries, zeroed. Each suite casts this
 * into its own event type, which is the only part of the shape that differs.
 */
export const baseEvent = {
  handlerTag: -1,
  numberOfPointers: 1,
  pointerType: 0,
  x: 0,
  y: 0,
  absoluteX: 0,
  absoluteY: 0,
  stylusData: undefined,
  translationX: 0,
  translationY: 0,
  changeX: 0,
  changeY: 0,
  velocityX: 0,
  velocityY: 0,
};

export const showModal = (swipeDirection: Direction | undefined) => {
  rntlRender(
    <GestureHandlerRootView>
      <MagicModalPortal />
    </GestureHandlerRootView>,
  );

  let promise: Promise<unknown> | undefined;

  act(() => {
    ({ promise } = magicModal.show(() => <ModalContent />, {
      swipeDirection,
    }));
  });

  return promise;
};

/**
 * The dismissal spring runs for several frames and its completion callback hops
 * from the UI thread back to JS via `scheduleOnRN`, so `hide` lands well after
 * the end callback returns. Poll on timers, which is what drives the spring;
 * awaiting the show promise instead deadlocks, because the frame loop doesn't
 * advance inside `act`.
 */
const tick = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const waitForHide = async (isResolved: () => boolean) => {
  for (let i = 0; i < 100 && !isResolved(); i++) {
    // Sequential on purpose: each tick has to let the spring advance before the
    // next poll reads `isResolved`, so there is nothing to run in parallel.
    // eslint-disable-next-line no-await-in-loop -- polling loop, see above
    await tick(20);
  }
};
