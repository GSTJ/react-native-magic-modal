/* eslint-disable react-native/no-color-literals */
import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { magicModal, Direction } from "react-native-magic-modal";
import { ExampleModal } from "@/components/ExampleModal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const showModal = async () => {
  const swipeDirection = ["top", "bottom", "left", "right"][
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

const Toast = () => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timeout = setTimeout(() => {
      magicModal.hide();
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={[styles.toastContainer, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <Text style={styles.toastText}>This is a toast!</Text>
    </View>
  );
};

const showToast = async () => {
  // eslint-disable-next-line no-console
  console.log("Opening toast");

  const toastResponse = await magicModal.show(() => <Toast />, {
    swipeDirection: "top",
    hideBackdrop: true,
    dampingFactor: 0,
    style: {
      justifyContent: "flex-start",
    },
  });

  // eslint-disable-next-line no-console
  console.log("Toast closed with response:", toastResponse);
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

const styles = StyleSheet.create({
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
