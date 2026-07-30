import type { HookHideFunction } from "../../constants/types";

import React, { useEffect } from "react";
import { BackHandler, Pressable, Text } from "react-native";

import {
  act,
  fireEvent,
  render as rntlRender,
  screen,
} from "@testing-library/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { MagicModalHideReason } from "../../constants/types";
import { magicModal } from "../../utils/magic-modal-handler";
import { useMagicModal } from "../magic-modal-provider";
import { MagicModalPortal } from "./magic-modal-portal";

const content = "Taveira";
const includeHiddenElements = { includeHiddenElements: true } as const;

const ModalContent = ({ testID }: { testID: string }) => (
  <Text testID={testID}>{content}</Text>
);

const IntentionalModal = () => {
  const { hide } = useMagicModal<{ answer: number }>();

  return (
    <Pressable testID="intentional-hide" onPress={() => hide({ answer: 42 })}>
      <Text>Finish</Text>
    </Pressable>
  );
};

/**
 * gesture-handler 3.x throws from `GestureDetector` when there is no
 * `GestureHandlerRootView` above it, where 2.x only warned. The portal renders
 * a `GestureDetector` for the swipe gesture, so every render here needs the
 * root view, same as in a real app.
 */
const render = (ui: React.ReactElement) =>
  rntlRender(<GestureHandlerRootView>{ui}</GestureHandlerRootView>);

describe("MagicModalPortal", () => {
  it("renders children only after show is called", async () => {
    render(<MagicModalPortal />);

    expect(screen.queryByTestId("first")).toBeNull();

    act(() => {
      magicModal.show(() => <ModalContent testID="first" />);
    });

    await expect(screen.findByTestId("first")).resolves.toBeTruthy();
  });

  it("resolves the show promise with the hide payload", async () => {
    render(<MagicModalPortal />);

    let result: Promise<unknown> | undefined;
    let modalID = "";

    act(() => {
      const modal = magicModal.show(() => <ModalContent testID="second" />);
      result = modal.promise;
      modalID = modal.modalID;
    });

    act(() => {
      magicModal.hide({ answer: 42 }, { modalID });
    });

    await expect(result).resolves.toStrictEqual({
      reason: MagicModalHideReason.INTENTIONAL_HIDE,
      data: { answer: 42 },
    });
    expect(screen.queryByTestId("second")).toBeNull();
  });

  it("resolves an intentional hide from the modal-scoped hook", async () => {
    render(<MagicModalPortal />);

    let result: Promise<unknown> | undefined;

    act(() => {
      result = magicModal.show<{ answer: number }>(IntentionalModal).promise;
    });

    fireEvent.press(screen.getByTestId("intentional-hide"));

    await expect(result).resolves.toStrictEqual({
      reason: MagicModalHideReason.INTENTIONAL_HIDE,
      data: { answer: 42 },
    });
  });

  it("hides only the targeted modal from the stack", async () => {
    render(<MagicModalPortal />);

    let bottomID = "";

    act(() => {
      bottomID = magicModal.show(() => (
        <ModalContent testID="bottom" />
      )).modalID;
      magicModal.show(() => <ModalContent testID="top" />);
    });

    await expect(
      screen.findByTestId("bottom", includeHiddenElements),
    ).resolves.toBeTruthy();
    await expect(screen.findByTestId("top")).resolves.toBeTruthy();

    act(() => {
      magicModal.hide(undefined, { modalID: bottomID });
    });

    expect(screen.queryByTestId("bottom", includeHiddenElements)).toBeNull();
    expect(screen.getByTestId("top")).toBeTruthy();
  });

  it("resolves every pending modal on hideAll", async () => {
    render(<MagicModalPortal />);

    let promises: Promise<unknown>[] = [];

    act(() => {
      promises = [
        magicModal.show(() => <ModalContent testID="a" />).promise,
        magicModal.show(() => <ModalContent testID="b" />).promise,
      ];
    });

    act(() => {
      magicModal.hideAll();
    });

    await expect(Promise.all(promises)).resolves.toStrictEqual([
      { reason: MagicModalHideReason.GLOBAL_HIDE_ALL },
      { reason: MagicModalHideReason.GLOBAL_HIDE_ALL },
    ]);
    expect(screen.queryByTestId("a")).toBeNull();
    expect(screen.queryByTestId("b")).toBeNull();
  });

  it("remounts updated content without replacing its stack entry or promise", async () => {
    render(<MagicModalPortal />);

    let update: (component: React.FC) => void = () => {};
    let result: Promise<unknown> | undefined;
    let resolved = false;
    let modalID = "";
    const lifecycle: string[] = [];

    const Before = () => {
      useEffect(() => {
        lifecycle.push("before:mount");
        return () => {
          lifecycle.push("before:unmount");
        };
      }, []);

      return <ModalContent testID="before" />;
    };

    const After = () => {
      useEffect(() => {
        lifecycle.push("after:mount");
        return () => {
          lifecycle.push("after:unmount");
        };
      }, []);

      return <ModalContent testID="after" />;
    };

    act(() => {
      const modal = magicModal.show(Before, {
        accessibilityLabel: "Persistent upload",
      });
      update = modal.update;
      result = modal.promise;
      modalID = modal.modalID;
      void result.then(() => {
        resolved = true;
      });
    });

    await expect(screen.findByTestId("before")).resolves.toBeTruthy();

    act(() => {
      update(After);
    });

    await expect(screen.findByTestId("after")).resolves.toBeTruthy();
    expect(screen.queryByTestId("before")).toBeNull();
    expect(lifecycle).toStrictEqual([
      "before:mount",
      "before:unmount",
      "after:mount",
    ]);
    expect(
      screen.getAllByTestId("magic-modal-stack-entry", includeHiddenElements),
    ).toHaveLength(1);
    expect(screen.getByTestId("magic-modal-dialog").props).toMatchObject({
      accessibilityLabel: "Persistent upload",
      role: "dialog",
    });
    expect(
      screen.getByTestId("magic-modal-backdrop", includeHiddenElements),
    ).toBeTruthy();
    expect(resolved).toBe(false);

    act(() => {
      magicModal.hide({ finished: true }, { modalID });
    });

    await expect(result).resolves.toStrictEqual({
      reason: MagicModalHideReason.INTENTIONAL_HIDE,
      data: { finished: true },
    });
  });

  it("updates only the targeted modal", async () => {
    render(<MagicModalPortal />);

    let updateBottom: (component: React.FC) => void = () => {};

    act(() => {
      updateBottom = magicModal.show(() => (
        <ModalContent testID="bottom" />
      )).update;
      magicModal.show(() => <ModalContent testID="top" />);
    });

    act(() => {
      updateBottom(() => <ModalContent testID="bottom-updated" />);
    });

    await expect(
      screen.findByTestId("bottom-updated", includeHiddenElements),
    ).resolves.toBeTruthy();
    expect(screen.getByTestId("top")).toBeTruthy();
    expect(screen.queryByTestId("bottom", includeHiddenElements)).toBeNull();
  });

  it("ignores updates for a modal that is already hidden", async () => {
    render(<MagicModalPortal />);

    let update: (component: React.FC) => void = () => {};
    let modalID = "";

    act(() => {
      const modal = magicModal.show(() => <ModalContent testID="gone" />);
      update = modal.update;
      modalID = modal.modalID;
    });

    act(() => {
      magicModal.hide(undefined, { modalID });
    });

    act(() => {
      update(() => <ModalContent testID="zombie" />);
    });

    expect(screen.queryByTestId("zombie")).toBeNull();
    expect(screen.queryByTestId("gone")).toBeNull();
  });

  it("hides on backdrop press", async () => {
    render(<MagicModalPortal />);

    let result: Promise<unknown> | undefined;

    act(() => {
      result = magicModal.show(() => (
        <ModalContent testID="backdrop" />
      )).promise;
    });

    fireEvent.press(
      screen.getByTestId("magic-modal-backdrop", includeHiddenElements),
    );

    // No `data` key at all, not `data: undefined` — `toStrictEqual` tells the
    // two apart and a backdrop press carries no payload.
    await expect(result).resolves.toStrictEqual({
      reason: MagicModalHideReason.BACKDROP_PRESS,
    });
  });

  it("keeps animated modal layers transparent to backdrop presses", () => {
    render(<MagicModalPortal />);

    act(() => {
      magicModal.show(() => <ModalContent testID="swipeable-content" />, {
        swipeDirection: "down",
      });
    });

    expect(
      screen.getByTestId("magic-modal-motion-layer", includeHiddenElements)
        .props,
    ).toMatchObject({
      pointerEvents: "box-none",
    });
    expect(
      screen.getByTestId("magic-modal-animation-layer", includeHiddenElements)
        .props,
    ).toMatchObject({
      pointerEvents: "box-none",
    });
  });

  it("keeps the backdrop out of the accessibility tree", () => {
    render(<MagicModalPortal />);

    act(() => {
      magicModal.show(() => <ModalContent testID="accessible-modal" />);
    });

    expect(
      screen.getByTestId("magic-modal-backdrop", includeHiddenElements).props,
    ).toMatchObject({
      accessibilityElementsHidden: true,
      accessibilityState: { disabled: false },
      accessible: false,
      "aria-hidden": true,
      importantForAccessibility: "no-hide-descendants",
    });
  });

  it("disables the backdrop press target when it is hidden", async () => {
    render(<MagicModalPortal />);

    let modalID = "";
    let resolved = false;

    act(() => {
      const modal = magicModal.show(
        () => <ModalContent testID="no-backdrop" />,
        { hideBackdrop: true },
      );
      modalID = modal.modalID;
      void modal.promise.then(() => {
        resolved = true;
      });
    });

    const backdrop = screen.getByTestId(
      "magic-modal-backdrop",
      includeHiddenElements,
    );
    expect(backdrop.props.accessibilityState).toMatchObject({
      disabled: true,
    });

    fireEvent.press(backdrop);
    await act(async () => {
      await Promise.resolve();
    });
    expect(resolved).toBe(false);

    act(() => {
      magicModal.hide(undefined, { modalID });
    });
  });

  it("exposes only the top stack entry as a modal dialog", () => {
    render(<MagicModalPortal />);

    let topID = "";

    expect(
      screen.getByTestId("magic-modal-portal", includeHiddenElements).props,
    ).toMatchObject({
      accessibilityElementsHidden: true,
      accessibilityViewIsModal: false,
      "aria-hidden": true,
      importantForAccessibility: "no-hide-descendants",
    });

    act(() => {
      magicModal.show(() => <ModalContent testID="bottom-dialog" />, {
        accessibilityLabel: "Bottom dialog",
      });
      topID = magicModal.show(() => <ModalContent testID="top-dialog" />, {
        accessibilityLabel: "Top dialog",
      }).modalID;
    });

    expect(screen.getByTestId("magic-modal-portal").props).toMatchObject({
      accessibilityElementsHidden: false,
      accessibilityViewIsModal: true,
      "aria-hidden": false,
      importantForAccessibility: "auto",
    });

    const entries = screen.getAllByTestId(
      "magic-modal-stack-entry",
      includeHiddenElements,
    );
    const dialogs = screen.getAllByTestId(
      "magic-modal-dialog",
      includeHiddenElements,
    );

    expect(entries[0]?.props).toMatchObject({
      accessibilityElementsHidden: true,
      "aria-hidden": true,
      importantForAccessibility: "no-hide-descendants",
      pointerEvents: "none",
    });
    expect(dialogs[0]?.props).toMatchObject({
      accessibilityViewIsModal: false,
      importantForAccessibility: "no-hide-descendants",
    });
    expect(dialogs[0]?.props.role).toBeUndefined();
    expect(dialogs[0]?.props["aria-modal"]).toBeUndefined();

    expect(entries[1]?.props).toMatchObject({
      accessibilityElementsHidden: false,
      "aria-hidden": false,
      importantForAccessibility: "auto",
      pointerEvents: "box-none",
    });
    expect(dialogs[1]?.props).toMatchObject({
      accessibilityLabel: "Top dialog",
      accessibilityViewIsModal: true,
      "aria-modal": true,
      importantForAccessibility: "auto",
      role: "dialog",
      tabIndex: -1,
    });

    act(() => {
      magicModal.hide(undefined, { modalID: topID });
    });

    expect(screen.getByTestId("magic-modal-dialog").props).toMatchObject({
      accessibilityLabel: "Bottom dialog",
      accessibilityViewIsModal: true,
      "aria-modal": true,
      role: "dialog",
    });
  });

  it("handles the native accessibility escape action as a system dismissal", async () => {
    render(<MagicModalPortal />);

    let result: Promise<unknown> | undefined;

    act(() => {
      result = magicModal.show(() => (
        <ModalContent testID="accessibility-escape" />
      )).promise;
    });

    fireEvent(screen.getByTestId("magic-modal-dialog"), "accessibilityEscape");

    await expect(result).resolves.toStrictEqual({
      reason: MagicModalHideReason.BACK_BUTTON_PRESS,
    });
  });

  it("lets the top modal consume the hardware back action", async () => {
    let hardwareBackPress: () => boolean | null | undefined = () => false;
    const remove = jest.fn();
    const addEventListener = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_eventName, handler) => {
        hardwareBackPress = handler;
        return { remove };
      });

    try {
      render(<MagicModalPortal />);

      let bottomResult: Promise<unknown> | undefined;
      let topResult: Promise<unknown> | undefined;

      act(() => {
        bottomResult = magicModal.show(() => (
          <ModalContent testID="back-bottom" />
        )).promise;
        topResult = magicModal.show(() => (
          <ModalContent testID="back-top" />
        )).promise;
      });

      let consumed: boolean | null | undefined = false;
      act(() => {
        consumed = hardwareBackPress();
      });

      expect(consumed).toBe(true);
      await expect(topResult).resolves.toStrictEqual({
        reason: MagicModalHideReason.BACK_BUTTON_PRESS,
      });
      expect(screen.getByTestId("back-bottom")).toBeTruthy();

      let bottomResolved = false;
      void bottomResult?.then(() => {
        bottomResolved = true;
      });
      expect(bottomResolved).toBe(false);

      act(() => {
        magicModal.hideAll();
      });
      await expect(bottomResult).resolves.toStrictEqual({
        reason: MagicModalHideReason.GLOBAL_HIDE_ALL,
      });
    } finally {
      addEventListener.mockRestore();
    }
  });

  it("lets a custom back handler decide when the modal closes", async () => {
    let hardwareBackPress: () => boolean | null | undefined = () => false;
    const addEventListener = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_eventName, handler) => {
        hardwareBackPress = handler;
        return { remove: jest.fn() };
      });

    try {
      render(<MagicModalPortal />);

      let result: Promise<unknown> | undefined;
      const onBackButtonPress = jest.fn(
        ({ hide }: { hide: HookHideFunction }) => {
          hide({ reason: MagicModalHideReason.BACK_BUTTON_PRESS });
        },
      );

      act(() => {
        result = magicModal.show(() => <ModalContent testID="custom-back" />, {
          onBackButtonPress,
        }).promise;
      });

      act(() => {
        hardwareBackPress();
      });

      expect(onBackButtonPress).toHaveBeenCalledTimes(1);
      await expect(result).resolves.toStrictEqual({
        reason: MagicModalHideReason.BACK_BUTTON_PRESS,
      });
    } finally {
      addEventListener.mockRestore();
    }
  });
});
