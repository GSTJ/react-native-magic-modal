/* eslint-disable react-native/no-color-literals */
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { magicModal, useMagicModal } from "react-native-magic-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const Toast = () => {
  const insets = useSafeAreaInsets();
  const { hide } = useMagicModal();

  useEffect(() => {
    const timeout = setTimeout(() => {
      hide();
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [hide]);

  return (
    <View style={[styles.toastContainer, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <Text style={styles.toastText}>This is a toast!</Text>
    </View>
  );
};
export const showToast = async () => {
  // eslint-disable-next-line no-console
  console.log("Opening toast");

  const toastResponse = await magicModal.show(() => <Toast />, {
    swipeDirection: "up",
    hideBackdrop: true,
    dampingFactor: 0,
    style: {
      justifyContent: "flex-start",
    },
  });

  // eslint-disable-next-line no-console
  console.log("Toast closed with response:", toastResponse);
};

export const styles = StyleSheet.create({
  toastContainer: {
    backgroundColor: "#000000",
    padding: 10,
  },
  toastText: {
    color: "#ffffff",
  },
});
