import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

import { MagicModalHideReason } from "../../constants/types";
import { magicModal } from "../../utils/magicModalHandler";
import { MagicModalPortal } from "./MagicModalPortal";

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

  describe("should return one of MagicModalHideTypes on automatic hides", () => {
    let modalResultPromise: unknown = null;

    beforeEach(async () => {
      render(<MagicModalPortal />);

      modalResultPromise = magicModal.show(() => (
        <Text testID="my-modal">Taveira</Text>
      ));
    });

    it("should return `MagicModalHideTypes.BACK_BUTTON_PRESS` when the back button is press", async () => {
      // modalRefForTests.current.props.onBackButtonPress();

      expect(await modalResultPromise).toBe({
        reason: MagicModalHideReason.BACK_BUTTON_PRESS,
      });
    });

    it("should return `MagicModalHideTypes.BACKDROP_PRESS` when the backdrop is press", async () => {
      // modalRefForTests.current.props.onBackdropPress();

      expect(await modalResultPromise).toBe({
        reason: MagicModalHideReason.BACKDROP_PRESS,
      });
    });

    it("should return `MagicModalHideTypes.SWIPE_COMPLETE` when the swipe is complete", async () => {
      // modalRefForTests.current.props.onSwipeComplete();

      expect(await modalResultPromise).toBe({
        reason: MagicModalHideReason.SWIPE_COMPLETE,
      });
    });
  });
});
