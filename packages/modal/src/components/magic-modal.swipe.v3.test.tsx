import type { PanGestureConfigCompat } from "./panGesture/gesture-handler-compat";

import React from "react";

import { act } from "@testing-library/react-native";

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
 * The swipe gesture is the one part of the modal the public API can't drive: it
 * lives inside a gesture-handler hook and its callbacks are worklets. So we
 * intercept the config `MagicModal` hands to `usePanGesture` and call the
 * callbacks ourselves.
 *
 * The point of these tests is the callback *names*. gesture-handler 3.x has both
 * `onDeactivate` (what 2.x's `.onEnd` used to be) and `onFinalize`, and
 * `onFinalize` additionally runs for gestures that never activated. Wiring the
 * dismissal to the wrong one leaves the modal looking correct in a manual test
 * while `SWIPE_COMPLETE` resolves at a different point in the gesture lifecycle.
 *
 * Defining `usePanGesture` in the mock also pins which surface renders:
 * `hasPanGestureHook` reads it off the module, so this suite exercises the
 * hook-based path whichever gesture-handler is installed. Its 2.x counterpart is
 * `magic-modal.swipe.v2.test.tsx`.
 */
jest.mock<Record<string, unknown>>("react-native-gesture-handler", () => {
  const actual = jest.requireActual<Record<string, unknown>>(
    "react-native-gesture-handler",
  );

  const capturedPanConfigs: PanGestureConfigCompat[] = [];

  return {
    ...actual,
    capturedPanConfigs,
    usePanGesture: (config: PanGestureConfigCompat) => {
      capturedPanConfigs.push(config);
      return { handlerTag: -1 };
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock<Record<string, unknown>>(
  "react-native-reanimated/lib/module/animation/spring/spring",
  () => {
    const actual = jest.requireActual<{
      withSpring: jest.MockableFunction;
    }>("react-native-reanimated/lib/module/animation/spring/spring");

    return {
      ...actual,
      withSpring: jest.fn(actual.withSpring),
    };
  },
);

const { capturedPanConfigs } = jest.requireMock<{
  capturedPanConfigs: PanGestureConfigCompat[];
}>("react-native-gesture-handler");

const { withSpring } = jest.requireMock<{
  withSpring: jest.Mock;
}>("react-native-reanimated/lib/module/animation/spring/spring");

/** The most recent config handed to `usePanGesture`, i.e. the live one. */
const latestPanConfig = () => {
  const config = capturedPanConfigs.at(-1);

  if (!config) {
    throw new Error("MagicModal never called usePanGesture");
  }

  return config;
};

type ActiveEvent = Parameters<
  NonNullable<PanGestureConfigCompat["onActivate"]>
>[0];
type UpdateEvent = Parameters<
  Extract<
    NonNullable<PanGestureConfigCompat["onUpdate"]>,
    (event: never) => void
  >
>[0];
type EndEvent = Parameters<
  NonNullable<PanGestureConfigCompat["onDeactivate"]>
>[0];

const activeEvent = () => baseEvent as unknown as ActiveEvent;

const endEvent = (velocity: { velocityX: number; velocityY: number }) =>
  ({ ...baseEvent, ...velocity, canceled: false }) as unknown as EndEvent;

/**
 * `onUpdate` is typed as the callback union'd with `Animated.event`, which isn't
 * callable. We only ever pass the callback form.
 */
const runOnUpdate = (
  config: PanGestureConfigCompat,
  translation: { translationX: number; translationY: number },
) => {
  const onUpdate = config.onUpdate as
    | ((event: UpdateEvent) => void)
    | undefined;

  onUpdate?.({ ...baseEvent, ...translation } as unknown as UpdateEvent);
};

beforeEach(() => {
  // No `hideAll` here. The testing library unmounts the portal between tests
  // already, and hiding into an unmounted tree makes React warn about updates
  // outside `act`.
  capturedPanConfigs.length = 0;
  withSpring.mockClear();
});

describe("MagicModal swipe gesture on gesture-handler 3.x", () => {
  it("hangs the dismissal off onDeactivate and leaves onFinalize alone", () => {
    showModal("down");

    const config = latestPanConfig();

    expect(typeof config.onActivate).toBe("function");
    expect(typeof config.onUpdate).toBe("function");
    expect(typeof config.onDeactivate).toBe("function");

    // `onFinalize` also runs for gestures that never activated: a tap that
    // failed the slop check, or a cancelled gesture. Anything hung off it would
    // run the dismissal on paths `.onEnd` never fired on.
    expect(config.onFinalize).toBeUndefined();
    expect(config.onBegin).toBeUndefined();
  });

  it("keeps the callbacks on the UI thread", () => {
    showModal("down");

    const config = latestPanConfig();

    // gesture-handler picks between the reanimated and the JS detector by
    // looking for `__workletHash` on the callbacks. Dropping the "worklet"
    // directives would silently move the whole swipe onto the JS thread.
    for (const name of ["onActivate", "onUpdate", "onDeactivate"] as const) {
      expect(config[name]).toHaveProperty("__workletHash");
    }
  });

  it("only enables the gesture when a swipeDirection is set", () => {
    showModal("down");
    expect(latestPanConfig().enabled).toBe(true);

    capturedPanConfigs.length = 0;
    showModal(undefined);
    expect(latestPanConfig().enabled).toBe(false);
  });

  it("forwards the touch slop as minDistance", () => {
    showModal("down");

    expect(latestPanConfig().minDistance).toBe(expectedMinDistance);
  });

  it("keeps the same config object across re-renders", () => {
    showModal("down");

    const first = latestPanConfig();
    const seen = capturedPanConfigs.length;

    act(() => {
      magicModal.show(() => <ModalContent />, { swipeDirection: "down" });
    });

    // The first modal re-renders when a second one is pushed. Its config has to
    // keep its identity: `usePanGesture` memoizes on it and re-pushes the whole
    // config to the native side whenever it changes.
    expect(capturedPanConfigs.length).toBeGreaterThan(seen);
    expect(capturedPanConfigs[0]).toBe(first);
  });

  it.each(directions)(
    "resolves with SWIPE_COMPLETE when the %s swipe clears the velocity threshold",
    async (swipeDirection) => {
      const promise = showModal(swipeDirection);
      const config = latestPanConfig();

      let result: unknown;
      void promise?.then((value) => {
        result = value;
      });

      await act(async () => {
        config.onActivate?.(activeEvent());
        config.onDeactivate?.(endEvent(fastVelocity[swipeDirection]));

        await waitForHide(() => result !== undefined);
      });

      expect(result).toStrictEqual({
        reason: MagicModalHideReason.SWIPE_COMPLETE,
      });
    },
  );

  it.each([
    ["down", { velocityX: 137, velocityY: 911 }, 911],
    ["right", { velocityX: 922, velocityY: 149 }, 922],
  ] as const)(
    "seeds the %s dismissal spring with velocity from its movement axis",
    async (swipeDirection, velocity, expectedVelocity) => {
      const promise = showModal(swipeDirection);
      const config = latestPanConfig();

      let resolved = false;
      void promise?.then(() => {
        resolved = true;
      });

      await act(async () => {
        config.onActivate?.(activeEvent());
        config.onDeactivate?.(endEvent(velocity));

        await waitForHide(() => resolved);
      });

      expect(withSpring).toHaveBeenCalledTimes(1);
      expect(withSpring).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({ velocity: expectedVelocity }),
        expect.any(Function),
      );
    },
  );

  it.each(directions)(
    "keeps the %s modal open when the swipe is under the velocity threshold",
    async (swipeDirection) => {
      const promise = showModal(swipeDirection);
      const config = latestPanConfig();

      let resolved = false;
      void promise?.then(() => {
        resolved = true;
      });

      act(() => {
        config.onActivate?.(activeEvent());
        runOnUpdate(config, { translationX: 5, translationY: 5 });
        config.onDeactivate?.(endEvent(slowVelocity));
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(resolved).toBe(false);
    },
  );
});
