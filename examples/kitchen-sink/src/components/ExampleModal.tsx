/* eslint-disable react-native/no-color-literals */
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMagicModal } from "react-native-magic-modal";

import { showToast } from "./Toast";

export const ExampleModal = () => {
  const { hide } = useMagicModal();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Example Modal</Text>
      <Text style={styles.body}>
        This is an example to showcase the imperative Magic Modal!
      </Text>
      <TouchableOpacity
        onPress={() => hide("close button pressed")}
        style={styles.buttonContainer}
      >
        <Text style={styles.button}>Close Modal</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={showToast} style={styles.buttonContainer}>
        <Text style={styles.button}>Open Toast</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    margin: 20,
    paddingHorizontal: 25,
    paddingVertical: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  body: {
    textAlign: "center",
    fontSize: 14,
  },
  buttonContainer: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 25,
    backgroundColor: "#fab54d",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
