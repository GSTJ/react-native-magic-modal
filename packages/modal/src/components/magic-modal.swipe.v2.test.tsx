import React from "react";
import { act } from "@testing-library/react-native";

import type { LegacyPanGesture } from "./panGesture/pan-gesture-surface.v2";
import { MagicModalHideReason } from "../constants/types";
import { magicModal } from "../utils/magic-modal-handler";
import {
  baseEvent,
  directions,
  expectedMinDistance,
  fastVelocity,
  ModalContent,
  showModal,
  slowVelocity,
  waitForHide,
} from "./magic-modal.swipe.harness";

/**
 * The gesture-handler 2.x half of the swipe coverage. Its 3.x counterpart is
 * `magic-modal.swipe.v3.test.tsx`; the assertions run in the same order so the
 * two read side by side.
 *
 * 2.x has no `usePanGesture`, so `MagicModal` builds a `Gesture.Pan()` instead.
 * The builder here is the real one, spread through from the actual module: the
 * callbacks and the config land on the gesture object itself, which is exactly
 * where gesture-handler's own event dispatcher reads them from. Only
 * `GestureDetector` is stubbed, and it doubles as the interception point.
 *
 * Clearing `usePanGesture` in the mock pins `hasPanGestureHook` to false, so this
 * suite drives the builder surface whichever gesture-handler is installed.
 *
 * The point of these tests is the callback *names*. `.onFinalize` also runs after
 * gestures that never activated, so hanging the dismissal off it instead of
 * `.onEnd` moves when `SWIPE_COMPLETE` resolves while still looking correct in a
 * manual test.
 */
jest.mock("react-native-gesture-handler", () => {
  const actual = jest.requireActual<Record<string, unknown>>(
    "react-native-gesture-handler",
  );

  const capturedGestures: LegacyPanGesture[] = [];

  return {
    ...actual,
    usePanGesture: undefined,
    capturedGestures,
    GestureDetector: ({
      gesture,
      children,
    }: {
      gesture: LegacyPanGesture;
      children: React.ReactNode;
    }) => {
      capturedGestures.push(gesture);
      return children;
    },
  };
});

const { capturedGestures } = jest.requireMock<{
  capturedGestures: LegacyPanGesture[];
}>("react-native-gesture-handler");

/** The most recent gesture handed to `GestureDetector`, i.e. the live one. */
const latestGesture = () => {
  const gesture = capturedGestures.at(-1);

  if (!gesture) {
    throw new Error("MagicModal never built a Gesture.Pan()");
  }

  return gesture;
};

type Handlers = LegacyPanGesture["handlers"];
type StateChangeEvent = Parameters<NonNullable<Handlers["onStart"]>>[0];
type UpdateEvent = Parameters<NonNullable<Handlers["onUpdate"]>>[0];

const activeEvent = () => baseEvent as unknown as StateChangeEvent;

const endEvent = (velocity: { velocityX: number; velocityY: number }) =>
  ({ ...baseEvent, ...velocity }) as unknown as StateChangeEvent;

const updateEvent = (translation: {
  translationX: number;
  translationY: number;
}) => ({ ...baseEvent, ...translation }) as unknown as UpdateEvent;

beforeEach(() => {
  // No `hideAll` here. The testing library unmounts the portal between tests
  // already, and hiding into an unmounted tree makes React warn about updates
  // outside `act`.
  capturedGestures.length = 0;
});

describe("MagicModal swipe gesture on gesture-handler 2.x", () => {
  it("hangs the dismissal off onEnd and leaves onFinalize alone", () => {
    showModal("down");

    const { handlers } = latestGesture();

    expect(typeof handlers.onStart).toBe("function");
    expect(typeof handlers.onUpdate).toBe("function");
    expect(typeof handlers.onEnd).toBe("function");

    // `.onFinalize` also runs for gestures that never activated: a tap that
    // failed the slop check, or a cancelled gesture. Anything hung off it would
    // run the dismissal on paths `.onEnd` never fired on.
    expect(handlers.onFinalize).toBeUndefined();
    expect(handlers.onBegin).toBeUndefined();
  });

  it("keeps the callbacks on the UI thread", () => {
    showModal("down");

    const gesture = latestGesture();

    // 2.x reads `__workletHash` off each registered callback and only mounts the
    // reanimated detector when all of them are worklets. Dropping the "worklet"
    // directives would silently move the whole swipe onto the JS thread.
    for (const name of ["onStart", "onUpdate", "onEnd"] as const) {
      expect(gesture.handlers[name]).toHaveProperty("__workletHash");
    }

    // The builder records the same verdict as it goes. `shouldUseReanimated`,
    // which reads this, can't be asserted directly: it also calls
    // `isRemoteDebuggingEnabled()`, which is always true under jest because
    // there is no `nativeCallSyncHook` on the global.
    expect(gesture.handlers.isWorklet).not.toContain(false);
  });

  it("only enables the gesture when a swipeDirection is set", () => {
    showModal("down");
    expect(latestGesture().config.enabled).toBe(true);

    capturedGestures.length = 0;
    showModal(undefined);
    expect(latestGesture().config.enabled).toBe(false);
  });

  it("forwards the touch slop as minDistance", () => {
    showModal("down");

    // `.minDistance()` writes through to `minDist`, which is the name the native
    // side takes.
    expect(latestGesture().config.minDist).toBe(expectedMinDistance);
  });

  it("keeps the same gesture object across re-renders", () => {
    showModal("down");

    const first = latestGesture();
    const seen = capturedGestures.length;

    act(() => {
      magicModal.show(() => <ModalContent />, { swipeDirection: "down" });
    });

    // The first modal re-renders when a second one is pushed. Its gesture has to
    // keep its identity: 2.x's `GestureDetector` compares `gestureId` to decide
    // whether to re-push the whole gesture to the native side, and every
    // `Gesture.Pan()` gets a fresh one.
    expect(capturedGestures.length).toBeGreaterThan(seen);
    expect(capturedGestures[0]).toBe(first);
  });

  it.each(directions)(
    "resolves with SWIPE_COMPLETE when the %s swipe clears the velocity threshold",
    async (swipeDirection) => {
      const promise = showModal(swipeDirection);
      const { handlers } = latestGesture();

      let result: unknown;
      void promise?.then((value) => {
        result = value;
      });

      await act(async () => {
        handlers.onStart?.(activeEvent());
        handlers.onEnd?.(endEvent(fastVelocity[swipeDirection]), true);

        await waitForHide(() => result !== undefined);
      });

      expect(result).toEqual({
        reason: MagicModalHideReason.SWIPE_COMPLETE,
      });
    },
  );

  it.each(directions)(
    "keeps the %s modal open when the swipe is under the velocity threshold",
    async (swipeDirection) => {
      const promise = showModal(swipeDirection);
      const { handlers } = latestGesture();

      let resolved = false;
      void promise?.then(() => {
        resolved = true;
      });

      act(() => {
        handlers.onStart?.(activeEvent());
        handlers.onUpdate?.(updateEvent({ translationX: 5, translationY: 5 }));
        handlers.onEnd?.(endEvent(slowVelocity), true);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(resolved).toBe(false);
    },
  );
});
