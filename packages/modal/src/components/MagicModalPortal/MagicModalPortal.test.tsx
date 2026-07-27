import React from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  act,
  fireEvent,
  render as rntlRender,
  screen,
} from "@testing-library/react-native";

import { MagicModalHideReason } from "../../constants/types";
import { magicModal } from "../../utils/magicModalHandler";
import { MagicModalPortal } from "./MagicModalPortal";

const content = "Taveira";

const ModalContent = ({ testID }: { testID: string }) => (
  <Text testID={testID}>{content}</Text>
);

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

    expect(await screen.findByTestId("first")).toBeTruthy();
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

    expect(await result).toEqual({
      reason: MagicModalHideReason.INTENTIONAL_HIDE,
      data: { answer: 42 },
    });
    expect(screen.queryByTestId("second")).toBeNull();
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

    expect(await screen.findByTestId("bottom")).toBeTruthy();
    expect(await screen.findByTestId("top")).toBeTruthy();

    act(() => {
      magicModal.hide(undefined, { modalID: bottomID });
    });

    expect(screen.queryByTestId("bottom")).toBeNull();
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

    expect(await Promise.all(promises)).toEqual([
      { reason: MagicModalHideReason.GLOBAL_HIDE_ALL },
      { reason: MagicModalHideReason.GLOBAL_HIDE_ALL },
    ]);
    expect(screen.queryByTestId("a")).toBeNull();
    expect(screen.queryByTestId("b")).toBeNull();
  });

  it("swaps the content without closing the modal", async () => {
    render(<MagicModalPortal />);

    let update: (component: React.FC) => void = () => {};
    let result: Promise<unknown> | undefined;
    let resolved = false;

    act(() => {
      const modal = magicModal.show(() => <ModalContent testID="before" />);
      update = modal.update;
      result = modal.promise;
      void result.then(() => {
        resolved = true;
      });
    });

    expect(await screen.findByTestId("before")).toBeTruthy();

    act(() => {
      update(() => <ModalContent testID="after" />);
    });

    expect(await screen.findByTestId("after")).toBeTruthy();
    expect(screen.queryByTestId("before")).toBeNull();
    expect(screen.getByTestId("magic-modal-backdrop")).toBeTruthy();
    expect(resolved).toBe(false);
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

    expect(await screen.findByTestId("bottom-updated")).toBeTruthy();
    expect(screen.getByTestId("top")).toBeTruthy();
    expect(screen.queryByTestId("bottom")).toBeNull();
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

    fireEvent.press(screen.getByTestId("magic-modal-backdrop"));

    expect(await result).toEqual({
      reason: MagicModalHideReason.BACKDROP_PRESS,
      data: undefined,
    });
  });
});
