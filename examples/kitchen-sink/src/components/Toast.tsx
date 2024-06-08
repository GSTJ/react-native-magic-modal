import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { magicModal } from "react-native-magic-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useMagicModal } from "react-native-magic-modal/components/MagicModalPortal/MagicModalPortal";
import { styles } from "../app";

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
