/* eslint-disable react-native/no-color-literals */
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { magicModal, Direction } from "react-native-magic-modal";
import { ExampleModal } from "@/components/ExampleModal";
import { router } from "expo-router";
import { ZoomIn, ZoomOut } from "react-native-reanimated";
import { showKeyboardAvoidingModal } from "@/components/KeyboardAvoidingModal";
import { showToast } from "../components/Toast";
import { ScrollView } from "react-native-gesture-handler";
import { showScrollableModal } from "@/components/ScrollableModal";

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

const showReplacingModals = async () => {
  const modalResponse = magicModal.show(() => <ExampleModal />);

  await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

  magicModal.hide("close timeout", { modalID: modalResponse.modalID });

  await modalResponse.promise;

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
