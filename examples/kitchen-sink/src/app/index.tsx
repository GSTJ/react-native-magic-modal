/* eslint-disable react-native/no-color-literals */
import type { Direction } from "react-native-magic-modal";

import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { magicModal, MagicModalHideReason } from "react-native-magic-modal";
import { ZoomIn, ZoomOut } from "react-native-reanimated";

import { ExampleModal } from "@/components/example-modal";
import { showKeyboardAvoidingModal } from "@/components/keyboard-avoiding-modal";
import { showScrollableModal } from "@/components/scrollable-modal";

import { showToast } from "../components/toast";

const showModal = async () => {
  const swipeDirection = ["up", "down", "left", "right"][
    Math.round(Math.random() * 3)
  ] as Direction;

  // eslint-disable-next-line no-console
  console.log("Opening modal");
  const modalResponse = magicModal.show(() => <ExampleModal />, {
    swipeDirection,
  });

  // eslint-disable-next-line no-console
  console.log(`Modal ID: ${modalResponse.modalID}`);

  // Closing the modal automatically, programmatically
  setTimeout(() => {
    magicModal.hide("close timeout", { modalID: modalResponse.modalID });
  }, 2000);

  // eslint-disable-next-line no-console
  console.log("Modal closed with response:", await modalResponse.promise);
};

interface ModalResponse {
  message: string;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const showReplacingModals = async () => {
  const modalResponse = magicModal.show<ModalResponse>(() => <ExampleModal />);

  await wait(1000);

  magicModal.hide<ModalResponse>(
    { message: "close timeout" },
    { modalID: modalResponse.modalID },
  );

  const res = await modalResponse.promise;

  if (res.reason === MagicModalHideReason.INTENTIONAL_HIDE) {
    // eslint-disable-next-line no-console
    console.log("Modal closed with response:", res.data.message);
  }

  return showKeyboardAvoidingModal({
    initialText: "Hello, World!",
  });
};

const showUndismissableModal = () => {
  magicModal.show(() => <ExampleModal />, {
    onBackButtonPress: () => {},
    onBackdropPress: () => {},
    swipeDirection: undefined,
  });
};

const showZoomInModal = () => {
  magicModal.show(() => <ExampleModal />, {
    entering: ZoomIn,
    exiting: ZoomOut,
    swipeDirection: undefined,
    animationInTiming: 1000,
    animationOutTiming: 1000,
  });
};

const showUpdatingModal = async () => {
  const { modalID, update } = magicModal.show(() => (
    <ExampleModal body="Closing in 3..." />
  ));

  await wait(1000);
  update(() => <ExampleModal body="Closing in 2..." />);

  await wait(1000);
  update(() => <ExampleModal body="Closing in 1..." />);

  await wait(1000);
  magicModal.hide(undefined, { modalID });
};

const showNoFullWindowOverlayModal = async () => {
  magicModal.disableFullWindowOverlay();
  await magicModal.show(() => <ExampleModal />).promise;
  magicModal.enableFullWindowOverlay();
};

const KitchenSinkScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <Pressable
        testID="show-modal-button"
        accessibilityRole="button"
        accessibilityLabel="Show Modal"
        accessible
        style={styles.button}
        onPress={showModal}
      >
        <Text style={styles.buttonText}>Show Modal</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showUndismissableModal}>
        <Text style={styles.buttonText}>Show Undismissable Modal</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showScrollableModal}>
        <Text style={styles.buttonText}>Show Scrollable Modal</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showReplacingModals}>
        <Text style={styles.buttonText}>Show Replacing Modals</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          showKeyboardAvoidingModal({
            initialText: "Hello, World!",
          });
        }}
      >
        <Text style={styles.buttonText}>Show Keyboard Avoiding Modal</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showZoomInModal}>
        <Text style={styles.buttonText}>Show Zoom In Modal</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showUpdatingModal}>
        <Text style={styles.buttonText}>Show Updating Modal</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showToast}>
        <Text style={styles.buttonText}>Show Toast</Text>
      </Pressable>
      <Pressable
        testID="swipe-tests-button"
        accessibilityRole="button"
        accessibilityLabel="Swipe To Dismiss"
        accessible
        style={styles.button}
        onPress={() => {
          router.push("/swipe");
        }}
      >
        <Text style={styles.buttonText}>Swipe To Dismiss</Text>
      </Pressable>
      {Platform.OS === "ios" && (
        <>
          <Pressable
            style={styles.button}
            onPress={() => {
              router.push("/modal");
            }}
          >
            <Text style={styles.buttonText}>Open Modal Screen</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={showNoFullWindowOverlayModal}
          >
            <Text style={styles.buttonText}>
              Show No Full Window Overlay Modal
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
};

export default KitchenSinkScreen;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  button: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
