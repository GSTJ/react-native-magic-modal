/* eslint-disable react-native/no-color-literals */
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { magicModal } from "@magic/react-native-magic-modal";
import { ExampleModal } from "@/components/ExampleModal";

export default () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          magicModal.show(() => <ExampleModal />, {
            forceFullScreen: true,
          })
        }
      >
        <Text style={styles.buttonText}>Press me!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
