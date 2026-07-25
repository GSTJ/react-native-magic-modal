import React from "react";
import { Text } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { MagicModalHideReason } from "../../constants/types";
import { magicModal } from "../../utils/magicModalHandler";
import { MagicModalPortal } from "./MagicModalPortal";

const content = "Taveira";

const ModalContent = ({ testID }: { testID: string }) => (
  <Text testID={testID}>{content}</Text>
);

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
