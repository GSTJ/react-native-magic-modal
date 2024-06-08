/* eslint-disable react-native/no-color-literals */
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { magicModal, Direction } from "react-native-magic-modal";
import { ExampleModal } from "@/components/ExampleModal";
import { router } from "expo-router";
import { ZoomIn, ZoomOut } from "react-native-reanimated";
import { showKeyboardAvoidingModal } from "@/components/KeyboardAvoidingModal";
import { showToast } from "../components/Toast";

const showModal = async () => {
  const swipeDirection = ["up", "down", "left", "right"][
    Math.round(Math.random() * 3)
  ] as Direction;

  // eslint-disable-next-line no-console
  console.log("Opening modal");
  const modalResponse = await magicModal.show(() => <ExampleModal />, {
    swipeDirection,
  });
  // eslint-disable-next-line no-console
  console.log("Modal closed with response:", modalResponse);
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={showModal}>
        <Text style={styles.buttonText}>Show Modal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={showUndismissableModal}>
        <Text style={styles.buttonText}>Show Undismissable Modal</Text>
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
    </View>
  );
};

export const styles = StyleSheet.create({
  toastContainer: {
    backgroundColor: "#000000",
    padding: 10,
  },
  toastText: {
    color: "#ffffff",
  },

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
