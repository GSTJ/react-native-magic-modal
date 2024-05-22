import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { magicModal } from "@magic/react-native-magic-modal";
import { ExampleModal } from "@/components/ExampleModal";

const showModal = async () => {
  console.log("Opening modal");
  const modalResponse = await magicModal.show(() => <ExampleModal />);
  console.log("Modal closed with response:", modalResponse);
};

export default function App() {
  useEffect(() => {
    showModal();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => magicModal.show(() => <ExampleModal />)}
      >
        <Text style={styles.buttonText}>Press me!</Text>
      </TouchableOpacity>
    </View>
  );
}

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
