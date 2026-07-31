import type { ElementType, ReactNode } from "react";

import React from "react";
import { Platform, Text, View } from "react-native";

import {
  act,
  render as rntlRender,
  screen,
} from "@testing-library/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  ANIMATION_DURATION_IN_MS,
  OVERLAY_UNMOUNT_GRACE_IN_MS,
} from "../../constants/animations";
import { magicModal } from "../../utils/magic-modal-handler";
import { MagicModal } from "../magic-modal";
import { createMagicModalPortal } from "./magic-modal-portal-base";
import { PortalContainer } from "./portal-container";
import { subscribeToSystemBack } from "./system-back";

/**
 * The iOS FullWindowOverlay is a native window. Left mounted with an empty
 * stack it owns the accessibility tree for the whole app, which is why the
 * portal only wraps itself in one while there is something to show.
 *
 * `createMagicModalPortal` takes the overlay as an argument, so these tests
 * pass a stub with a testID instead of reaching for react-native-screens. The
 * chrome is the Reanimated one the native portal injects, and with it the
 * default `leaveStack`: a dismissed entry leaves the stack on the spot.
 */
const OVERLAY_TEST_ID = "full-window-overlay-stub";
const includeHiddenElements = { includeHiddenElements: true } as const;

const FullWindowOverlayStub: ElementType = ({
  children,
}: {
  children?: ReactNode;
}) => <View testID={OVERLAY_TEST_ID}>{children}</View>;

/**
 * The portal takes every platform decision as an argument, so whether the
 * platform has a full-window overlay at all is passed in rather than read off
 * `Platform.OS` at render time. The container and the back-button subscription
 * are the real React Native ones.
 */
const createTestPortal = (isFullWindowOverlaySupported = true) =>
  createMagicModalPortal({
    FullWindowOverlay: FullWindowOverlayStub,
    isFullWindowOverlaySupported,
    PortalContainer,
    StackEntry: MagicModal,
    subscribeToSystemBack,
  });

const TestPortal = createTestPortal();

const ModalContent = () => <Text testID="overlay-modal">Taveira</Text>;

const render = (Portal: React.FC = TestPortal) =>
  rntlRender(
    <GestureHandlerRootView>
      <Portal />
    </GestureHandlerRootView>,
  );

const queryOverlay = () =>
  screen.queryByTestId(OVERLAY_TEST_ID, includeHiddenElements);

/** The window the portal waits out before it drops the native overlay. */
const exitWindow = (animationOutTiming = ANIMATION_DURATION_IN_MS): number =>
  animationOutTiming + OVERLAY_UNMOUNT_GRACE_IN_MS;

const advanceBy = (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

// `Platform.OS` is typed as the literal of whichever platform the type
// resolution picked, so it is widened here to swap in another one.
const platformModule = Platform as unknown as { OS: string };

describe("MagicModalPortal full window overlay", () => {
  let platform: { replaceValue: (value: string) => void; restore: () => void };

  beforeEach(() => {
    jest.useFakeTimers();
    platform = jest.replaceProperty(platformModule, "OS", "ios");
  });

  afterEach(() => {
    act(() => {
      magicModal.hideAll();
    });
    // Drains the unmount the line above just scheduled, so it cannot fire
    // outside `act` once the timers go back to real.
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    platform.restore();
  });

  it("leaves the overlay unmounted while the stack is empty", () => {
    render();

    expect(
      screen.getByTestId("magic-modal-portal", includeHiddenElements),
    ).toBeTruthy();
    expect(queryOverlay()).toBeNull();
  });

  it("wraps the portal in the overlay once a modal is shown", () => {
    render();

    act(() => {
      magicModal.show(ModalContent);
    });

    expect(queryOverlay()).toBeTruthy();
    expect(screen.getByTestId("overlay-modal")).toBeTruthy();
    // The stack lives inside the overlay, not beside it.
    expect(
      screen.getByTestId(OVERLAY_TEST_ID).findByProps({
        testID: "magic-modal-portal",
      }),
    ).toBeTruthy();
  });

  it("keeps the overlay mounted while the closing modal animates out", () => {
    render();

    let modalID = "";
    act(() => {
      modalID = magicModal.show(ModalContent).modalID;
    });

    act(() => {
      magicModal.hide(undefined, { modalID });
    });

    // The entry is gone from state, the exit animation is not.
    expect(screen.queryByTestId("overlay-modal")).toBeNull();
    expect(queryOverlay()).toBeTruthy();

    advanceBy(exitWindow() - 1);
    expect(queryOverlay()).toBeTruthy();

    advanceBy(1);
    expect(queryOverlay()).toBeNull();
  });

  it("waits out a longer animationOutTiming before unmounting", () => {
    render();

    const animationOutTiming = 1000;
    let modalID = "";

    act(() => {
      modalID = magicModal.show(ModalContent, { animationOutTiming }).modalID;
    });

    act(() => {
      magicModal.hide(undefined, { modalID });
    });

    advanceBy(exitWindow() + 1);
    expect(queryOverlay()).toBeTruthy();

    advanceBy(exitWindow(animationOutTiming));
    expect(queryOverlay()).toBeNull();
  });

  it("unmounts the overlay after hideAll clears the stack", () => {
    render();

    act(() => {
      magicModal.show(ModalContent);
      magicModal.show(ModalContent);
    });

    act(() => {
      magicModal.hideAll();
    });

    expect(queryOverlay()).toBeTruthy();

    advanceBy(exitWindow());
    expect(queryOverlay()).toBeNull();
  });

  it("cancels the pending unmount when another modal opens during the exit window", () => {
    render();

    let modalID = "";
    act(() => {
      modalID = magicModal.show(ModalContent).modalID;
    });

    act(() => {
      magicModal.hide(undefined, { modalID });
    });

    advanceBy(exitWindow() - 10);
    expect(queryOverlay()).toBeTruthy();

    act(() => {
      magicModal.show(ModalContent);
    });

    // Past the deadline the first modal had scheduled: no blink between the two.
    advanceBy(exitWindow());
    expect(queryOverlay()).toBeTruthy();
    expect(screen.getByTestId("overlay-modal")).toBeTruthy();
  });

  it("never mounts the overlay where the platform has no full-window overlay", () => {
    render(createTestPortal(false));

    act(() => {
      magicModal.show(ModalContent);
    });

    expect(screen.getByTestId("overlay-modal")).toBeTruthy();
    expect(queryOverlay()).toBeNull();
  });

  it("keeps the overlay off while it is globally disabled", () => {
    render();

    act(() => {
      magicModal.disableFullWindowOverlay();
    });

    act(() => {
      magicModal.show(ModalContent);
    });

    expect(screen.getByTestId("overlay-modal")).toBeTruthy();
    expect(queryOverlay()).toBeNull();

    act(() => {
      magicModal.enableFullWindowOverlay();
    });

    expect(queryOverlay()).toBeTruthy();
  });
});
