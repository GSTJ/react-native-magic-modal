import type { PanGestureConfig } from "react-native-gesture-handler";
import React from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { act, render as rntlRender } from "@testing-library/react-native";

import type { Direction } from "../constants/types";
import { MagicModalHideReason } from "../constants/types";
import { magicModal } from "../utils/magicModalHandler";
import { MagicModalPortal } from "./MagicModalPortal/MagicModalPortal";

/**
 * The swipe gesture is the one part of the modal the public API can't drive:
 * it lives inside a gesture-handler hook and its callbacks are worklets. So we
 * intercept the config `MagicModal` hands to `usePanGesture` and call the
 * callbacks ourselves.
 *
 * The point of these tests is the callback *names*. gesture-handler 3.x has
 * both `onDeactivate` (what `.onEnd` used to be) and `onFinalize`, and
 * `onFinalize` additionally runs for gestures that never activated. Wiring the
 * dismissal to the wrong one leaves the modal looking correct in a manual test
 * while `SWIPE_COMPLETE` resolves at a different point in the gesture
 * lifecycle.
 */
jest.mock("react-native-gesture-handler", () => {
  const actual = jest.requireActual<Record<string, unknown>>(
    "react-native-gesture-handler",
  );

  const capturedPanConfigs: PanGestureConfig[] = [];

  return {
    ...actual,
    capturedPanConfigs,
    usePanGesture: (config: PanGestureConfig) => {
      capturedPanConfigs.push(config);
      return { handlerTag: -1 };
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  };
});

const { capturedPanConfigs } = jest.requireMock<{
  capturedPanConfigs: PanGestureConfig[];
}>("react-native-gesture-handler");

const content = "Taveira";

const ModalContent = () => <Text testID="swipe-content">{content}</Text>;

/** The most recent config handed to `usePanGesture`, i.e. the live one. */
const latestPanConfig = () => {
  const config = capturedPanConfigs.at(-1);

  if (!config) {
    throw new Error("MagicModal never called usePanGesture");
  }

  return config;
};

const showModal = (swipeDirection: Direction | undefined) => {
  rntlRender(
    <GestureHandlerRootView>
      <MagicModalPortal />
    </GestureHandlerRootView>,
  );

  let promise: Promise<unknown> | undefined;

  act(() => {
    promise = magicModal.show(() => <ModalContent />, {
      swipeDirection,
    }).promise;
  });

  return promise;
};

const baseEvent = {
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

type ActiveEvent = Parameters<NonNullable<PanGestureConfig["onActivate"]>>[0];
type UpdateEvent = Parameters<
  Extract<NonNullable<PanGestureConfig["onUpdate"]>, (event: never) => void>
>[0];
type EndEvent = Parameters<NonNullable<PanGestureConfig["onDeactivate"]>>[0];

const activeEvent = () => baseEvent as unknown as ActiveEvent;

const endEvent = (velocity: { velocityX: number; velocityY: number }) =>
  ({ ...baseEvent, ...velocity, canceled: false }) as unknown as EndEvent;

/**
 * `onUpdate` is typed as the callback union'd with `Animated.event`, which
 * isn't callable. We only ever pass the callback form.
 */
const runOnUpdate = (
  config: PanGestureConfig,
  translation: { translationX: number; translationY: number },
) => {
  const onUpdate = config.onUpdate as
    ((event: UpdateEvent) => void) | undefined;

  onUpdate?.({ ...baseEvent, ...translation } as unknown as UpdateEvent);
};

const fastVelocity = {
  up: { velocityX: 0, velocityY: -900 },
  down: { velocityX: 0, velocityY: 900 },
  left: { velocityX: -900, velocityY: 0 },
  right: { velocityX: 900, velocityY: 0 },
} satisfies Record<Direction, { velocityX: number; velocityY: number }>;

const directions = ["up", "down", "left", "right"] as const;

beforeEach(() => {
  // No `hideAll` here. The testing library unmounts the portal between tests
  // already, and hiding into an unmounted tree makes React warn about updates
  // outside `act`.
  capturedPanConfigs.length = 0;
});

describe("MagicModal swipe gesture", () => {
  it("hangs the dismissal off onDeactivate and leaves onFinalize alone", () => {
    showModal("down");

    const config = latestPanConfig();

    expect(typeof config.onActivate).toBe("function");
    expect(typeof config.onUpdate).toBe("function");
    expect(typeof config.onDeactivate).toBe("function");

    // `onFinalize` also runs for gestures that never activated: a tap that
    // failed the slop check, or a cancelled gesture. Anything hung off it
    // would run the dismissal on paths `.onEnd` never fired on.
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

  it("keeps the same config object across re-renders", () => {
    showModal("down");

    const first = latestPanConfig();
    const seen = capturedPanConfigs.length;

    act(() => {
      magicModal.show(() => <ModalContent />, { swipeDirection: "down" });
    });

    // The first modal re-renders when a second one is pushed. Its config has
    // to keep its identity: `usePanGesture` memoizes on it and re-pushes the
    // whole config to the native side whenever it changes.
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

        // The dismissal spring runs for several frames and its completion
        // callback hops from the UI thread back to JS via `scheduleOnRN`, so
        // `hide` lands well after `onDeactivate` returns. Poll on timers, which
        // is what drives the spring; awaiting the show promise in here instead
        // deadlocks, because the frame loop doesn't advance inside `act`.
        for (let i = 0; i < 100 && result === undefined; i++) {
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
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
      const config = latestPanConfig();

      let resolved = false;
      void promise?.then(() => {
        resolved = true;
      });

      act(() => {
        config.onActivate?.(activeEvent());
        runOnUpdate(config, { translationX: 5, translationY: 5 });
        config.onDeactivate?.(endEvent({ velocityX: 10, velocityY: 10 }));
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(resolved).toBe(false);
    },
  );
});
