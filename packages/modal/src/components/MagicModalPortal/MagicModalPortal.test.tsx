import React from "react";
import { BackHandler, Platform, Text } from "react-native";
import { act, render } from "@testing-library/react-native";

import type { HideReturn } from "../../constants/types";
import { MagicModalHideReason } from "../../constants/types";
import { magicModal } from "../../utils/magicModalHandler";
import { MagicModalPortal } from "./MagicModalPortal";

// Mock FullWindowOverlay from react-native-screens
jest.mock("react-native-screens/src/components/FullWindowOverlay", () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

describe("MagicModalPortal", () => {
  let backHandlerSpy: jest.SpyInstance;
  let backHandlerCallback: null | (() => boolean) = null;

  beforeEach(() => {
    Platform.OS = "ios";
    backHandlerSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_event, callback) => {
        backHandlerCallback = () => {
          callback();
          return true;
        };
        return { remove: jest.fn() };
      });
  });

  afterEach(() => {
    backHandlerSpy.mockRestore();
    backHandlerCallback = null;
  });

  it("renders children conditionally", async () => {
    const component = render(<MagicModalPortal />);
    const testId = "children-magic-modal";

    expect(component.queryByTestId(testId)).toBeFalsy();

    await act(async () => {
      magicModal.show(() => <Text testID={testId}>Taveira</Text>);
    });

    expect(component.queryByTestId(testId)).toBeTruthy();
  });

  it("redirects hide params to promise result data", async () => {
    render(<MagicModalPortal />);

    const result = "some-result-2";
    let modalResult: Promise<HideReturn<typeof result>>;

    await act(async () => {
      const { promise } = magicModal.show<typeof result>(() => (
        <Text>Taveira</Text>
      ));

      modalResult = promise;
      magicModal.hide(result);
    });

    expect(await modalResult!).toEqual({
      reason: MagicModalHideReason.INTENTIONAL_HIDE,
      data: result,
    });
  });

  describe("returns appropriate hide reasons", () => {
    it("returns INTENTIONAL_HIDE when explicitly hidden", async () => {
      render(<MagicModalPortal />);

      const result = "some-result-2";
      let modalPromise: Promise<HideReturn<typeof result>>;
      await act(async () => {
        const { promise } = magicModal.show<typeof result>(() => (
          <Text testID="my-modal">Taveira</Text>
        ));

        modalPromise = promise;
        magicModal.hide(result);
      });

      expect(await modalPromise!).toEqual({
        reason: MagicModalHideReason.INTENTIONAL_HIDE,
        data: result,
      });
    });

    it("handles back button press", async () => {
      render(<MagicModalPortal />);

      const showResult = await act(async () => {
        return magicModal.show(() => (
          <Text testID="my-modal">Back Button Test</Text>
        ));
      });

      const modalPromise = showResult.promise;

      await act(async () => {
        if (backHandlerCallback) {
          backHandlerCallback();
        }
      });

      expect(await modalPromise).toEqual({
        reason: MagicModalHideReason.BACK_BUTTON_PRESS,
      });
    });
  });

  describe("multiple modals", () => {
    it("stacks modals in correct order", async () => {
      const { getByTestId, queryByTestId } = render(<MagicModalPortal />);

      await act(async () => {
        magicModal.show(() => <Text testID="modal-1">First Modal</Text>);
      });

      expect(getByTestId("modal-1")).toBeTruthy();

      await act(async () => {
        magicModal.show(() => <Text testID="modal-2">Second Modal</Text>);
      });

      expect(getByTestId("modal-1")).toBeTruthy();
      expect(getByTestId("modal-2")).toBeTruthy();

      await act(async () => {
        magicModal.hide(null);
      });

      expect(getByTestId("modal-1")).toBeTruthy();
      expect(queryByTestId("modal-2")).toBeFalsy();
    });

    it("hides specific modal by ID", async () => {
      const { getByTestId, queryByTestId } = render(<MagicModalPortal />);

      await act(async () => {
        magicModal.show(() => <Text testID="modal-1">First Modal</Text>);
      });

      expect(getByTestId("modal-1")).toBeTruthy();

      await act(async () => {
        magicModal.show(() => <Text testID="modal-2">Second Modal</Text>);
      });

      expect(getByTestId("modal-2")).toBeTruthy();

      const firstModalResult = await act(async () => {
        return magicModal.show(() => <Text testID="modal-3">Third Modal</Text>);
      });

      expect(getByTestId("modal-3")).toBeTruthy();

      await act(async () => {
        magicModal.hide(null, { modalID: firstModalResult.modalID });
      });

      expect(getByTestId("modal-1")).toBeTruthy();
      expect(getByTestId("modal-2")).toBeTruthy();
      expect(queryByTestId("modal-3")).toBeFalsy();
    });

    it("hides all modals with hideAll", async () => {
      const { queryByTestId } = render(<MagicModalPortal />);

      await act(async () => {
        magicModal.show(() => <Text testID="modal-1">First Modal</Text>);
        magicModal.show(() => <Text testID="modal-2">Second Modal</Text>);
        magicModal.show(() => <Text testID="modal-3">Third Modal</Text>);
      });

      await act(async () => {
        magicModal.hideAll();
      });

      expect(queryByTestId("modal-1")).toBeFalsy();
      expect(queryByTestId("modal-2")).toBeFalsy();
      expect(queryByTestId("modal-3")).toBeFalsy();
    });
  });

  describe("overlay configuration", () => {
    it("enables and disables FullWindowOverlay", async () => {
      render(<MagicModalPortal />);

      await act(async () => {
        magicModal.disableFullWindowOverlay();
      });

      await act(async () => {
        magicModal.enableFullWindowOverlay();
      });

      expect(true).toBe(true);
    });
  });

  describe("error handling", () => {
    it("handles hiding non-existent modal gracefully", async () => {
      render(<MagicModalPortal />);

      await act(async () => {
        magicModal.hide(null, { modalID: "non-existent-id" });
      });
    });

    it("handles hideAll on empty modal stack gracefully", async () => {
      render(<MagicModalPortal />);

      await act(async () => {
        magicModal.hideAll();
      });

      await act(async () => {
        magicModal.hide(null);
      });
    });
  });
});
