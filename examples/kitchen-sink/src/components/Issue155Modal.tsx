/* eslint-disable react-native/no-color-literals */
import React from "react";
import { View, Button, Text, StyleSheet, Platform } from "react-native";
import { useMagicModal } from "react-native-magic-modal";
import { router } from "expo-router";

export const Issue155Modal = () => {
  const { hide } = useMagicModal();

  const handleNavigate = () => {
    // On Android, add a small delay to prevent crash (Issue #155)
    hide();
    if (Platform.OS === "android") {
      setTimeout(() => {
        router.push("/issue155");
      }, 100);
    } else {
      router.push("/issue155");
    }
  };

  const handleNavigateWithDelay = () => {
    hide();
    // Manual delay for testing
    setTimeout(() => {
      router.push("/issue155");
    }, 100);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Issue #155 Reproduction Modal</Text>
      <Text style={styles.description}>
        Press a button to hide modal and navigate
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Navigate Immediately"
          onPress={handleNavigate}
        />
        <Button
          title="Navigate with 100ms Delay"
          onPress={handleNavigateWithDelay}
        />
        <Button
          title="Just Close"
          onPress={() => {
            hide();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 10,
  },
});