import React from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Issue155TestPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Issue #155 Test Page</Text>
      <Text style={styles.description}>
        This is the destination page that we navigate to after hiding the modal.
      </Text>
      <Button
        title="Go Back"
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
});