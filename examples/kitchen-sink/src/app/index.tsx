/* eslint-disable react-native/no-color-literals */
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  Direction,
  magicModal,
  MagicModalHideReason,
} from "react-native-magic-modal";
import { ZoomIn, ZoomOut } from "react-native-reanimated";
import { router } from "expo-router";

import { ExampleModal } from "@/components/ExampleModal";
import { showKeyboardAvoidingModal } from "@/components/KeyboardAvoidingModal";
import { showScrollableModal } from "@/components/ScrollableModal";
import { showToast } from "../components/Toast";

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
  console.log("Modal ID: " + modalResponse.modalID);

  // Closing the modal automatically, programmatically
  setTimeout(() => {
    magicModal.hide("close timeout", { modalID: modalResponse.modalID });
  }, 2000);

  // eslint-disable-next-line no-console
  console.log("Modal closed with response:", await modalResponse.promise);
};

type ModalResponse = {
  message: string;
};

const showReplacingModals = async () => {
  const modalResponse = magicModal.show<ModalResponse>(() => <ExampleModal />);

  await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

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

const showUndismissableModal = async () => {
  magicModal.show(() => <ExampleModal />, {
    onBackButtonPress: () => {},
    onBackdropPress: () => {},
    swipeDirection: undefined,
  });
};

const showZoomInModal = async () => {
  magicModal.show(() => <ExampleModal />, {
    entering: ZoomIn,
    exiting: ZoomOut,
    swipeDirection: undefined,
    animationInTiming: 1000,
    animationOutTiming: 1000,
  });
};

export default () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.button} onPress={showModal}>
        <Text style={styles.buttonText}>Show Modal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={showUndismissableModal}>
        <Text style={styles.buttonText}>Show Undismissable Modal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={showScrollableModal}>
        <Text style={styles.buttonText}>Show Scrollable Modal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={showReplacingModals}>
        <Text style={styles.buttonText}>Show Replacing Modals</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          showKeyboardAvoidingModal({
            initialText: "Hello, World!",
          });
        }}
      >
        <Text style={styles.buttonText}>Show Keyboard Avoiding Modal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={showZoomInModal}>
        <Text style={styles.buttonText}>Show Zoom In Modal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={showToast}>
        <Text style={styles.buttonText}>Show Toast</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/modal")}
      >
        <Text style={styles.buttonText}>Open Modal Screen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

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
