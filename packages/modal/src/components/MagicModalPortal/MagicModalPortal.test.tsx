import React from "react";
import { Text } from "react-native";
import { act, render } from "@testing-library/react-native";

import { MagicModalHideReason } from "../../constants/types";
import { magicModal } from "../../utils/magicModalHandler";
import { MagicModalPortal } from "./MagicModalPortal";

describe("MagicModalPortal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", async () => {
    const component = render(<MagicModalPortal />);
    expect(component).toMatchSnapshot();
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

    let modalResult;
    await act(async () => {
      const { promise } = magicModal.show(() => <Text>Taveira</Text>);

      // Store the promise for later resolution
      modalResult = promise;

      // Hide with specific data
      magicModal.hide("some-result-2");
    });

    // The promise should resolve with the hide params in the data field
    expect(await modalResult).toEqual({
      reason: MagicModalHideReason.INTENTIONAL_HIDE,
      data: "some-result-2",
    });
  });

  describe("returns appropriate hide reasons", () => {
    it("returns INTENTIONAL_HIDE when explicitly hidden", async () => {
      render(<MagicModalPortal />);

      let modalPromise;
      await act(async () => {
        const { promise } = magicModal.show(() => (
          <Text testID="my-modal">Taveira</Text>
        ));

        modalPromise = promise;

        // Explicitly hide with data
        magicModal.hide("test-data");
      });

      const result = await modalPromise;
      expect(result).toEqual({
        reason: MagicModalHideReason.INTENTIONAL_HIDE,
        data: "test-data",
      });
    });
  });
});
