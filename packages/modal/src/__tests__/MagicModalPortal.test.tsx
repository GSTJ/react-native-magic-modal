import React from "react";
import { Text, View } from "react-native";
import { render, waitFor } from "@testing-library/react-native";
import { MagicModalPortal } from "../components/MagicModalPortal/MagicModalPortal";
import { magicModal } from "../utils/magicModalHandler";

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const GestureHandler = jest.requireActual("react-native-gesture-handler");
  return {
    ...GestureHandler,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  };
});

const TestModal = () => (
  <View testID="test-modal">
    <Text>Test Modal</Text>
  </View>
);

describe("MagicModalPortal", () => {
  beforeEach(() => {
    magicModal.hideAll();
  });

  it("should delay promise resolution when hiding modal", async () => {
    render(<MagicModalPortal />);
    
    let resolved = false;
    const modalPromise = magicModal.show(() => <TestModal />);
    
    // Start hiding the modal
    const hidePromise = modalPromise.promise.then(() => {
      resolved = true;
    });
    
    // Hide the modal
    magicModal.hide(undefined, { modalID: modalPromise.modalID });
    
    // Promise should not resolve immediately
    expect(resolved).toBe(false);
    
    // Wait for the delayed resolution
    await waitFor(() => expect(resolved).toBe(true), { timeout: 100 });
  });

  it("should hide all modals with delayed promise resolution", async () => {
    render(<MagicModalPortal />);
    
    const resolvedStates: boolean[] = [false, false];
    
    const modal1Promise = magicModal.show(() => <TestModal />);
    const modal2Promise = magicModal.show(() => <TestModal />);
    
    modal1Promise.promise.then(() => {
      resolvedStates[0] = true;
    });
    
    modal2Promise.promise.then(() => {
      resolvedStates[1] = true;
    });
    
    // Hide all modals
    magicModal.hideAll();
    
    // Promises should not resolve immediately
    expect(resolvedStates).toEqual([false, false]);
    
    // Wait for delayed resolution
    await waitFor(() => {
      expect(resolvedStates).toEqual([true, true]);
    }, { timeout: 100 });
  });
});