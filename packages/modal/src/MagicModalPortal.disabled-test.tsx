// TODO: Re-enable tests when we figure out the jest issues on the project.
import React from "react";
import { Text } from "react-native";
import { render, waitFor } from "@testing-library/react-native";

import { magicModal } from "./utils/magicModalHandler";
import {
  MagicModalHideTypes,
  MagicModalPortal,
  modalRefForTests,
} from "./MagicModalPortal";
import { setUpTests } from "react-native-reanimated";

jest.mock("react-native-screens", () => ({
  FullWindowOverlay: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

setUpTests();

describe("MagicModal", () => {
  it("renders correctly", async () => {
    const component = render(<MagicModalPortal />);

    expect(component).toMatchSnapshot();
  });

  it("renders children conditionally", () => {
    const component = render(<MagicModalPortal />);

    const testId = "children-magic-modal";

    expect(component.queryByTestId(testId)).toBeFalsy();

    magicModal.show(() => <Text testID={testId}>Taveira</Text>);

    expect(component.queryByTestId(testId)).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should redirect hide params as show promise result", async () => {
    render(<MagicModalPortal />);

    const modalResultPromise = magicModal.show(() => <Text>Taveira</Text>);

    magicModal.hide("some-result-2");

    const modalResult = await modalResultPromise;
    expect(modalResult).toBe("some-result-2");
  });

  it("should override old modal on show", async () => {
    const component = render(<MagicModalPortal />);

    const oldModalRetunPromise = magicModal.show(() => (
      <Text testID="old-modal">Taveira</Text>
    ));

    await waitFor(() => {
      expect(component.queryByTestId("old-modal")).toBeTruthy();
      expect(component.queryByTestId("new-modal")).toBeFalsy();
    });

    magicModal.show(() => <Text testID="new-modal">Taveira</Text>);

    expect(await oldModalRetunPromise).toBe(MagicModalHideTypes.MODAL_OVERRIDE);

    await waitFor(() => {
      expect(component.queryByTestId("new-modal")).toBeTruthy();
      expect(component.queryByTestId("old-modal")).toBeFalsy();
    });
  });

  describe("should return one of MagicModalHideTypes on automatic hides", () => {
    let modalResultPromise: any = null;

    beforeEach(async () => {
      render(<MagicModalPortal />);

      modalResultPromise = magicModal.show(() => (
        <Text testID="my-modal">Taveira</Text>
      ));
    });

    it("should return `MagicModalHideTypes.BACK_BUTTON_PRESSED` when the back button is pressed", async () => {
      modalRefForTests.current.props.onBackButtonPress();

      expect(await modalResultPromise).toBe(
        MagicModalHideTypes.BACK_BUTTON_PRESSED,
      );
    });

    it("should return `MagicModalHideTypes.BACKDROP_PRESSED` when the backdrop is pressed", async () => {
      modalRefForTests.current.props.onBackdropPress();

      expect(await modalResultPromise).toBe(
        MagicModalHideTypes.BACKDROP_PRESSED,
      );
    });

    it("should return `MagicModalHideTypes.SWIPE_COMPLETED` when the swipe is complete", async () => {
      modalRefForTests.current.props.onSwipeComplete();

      expect(await modalResultPromise).toBe(
        MagicModalHideTypes.SWIPE_COMPLETED,
      );
    });
  });
});
