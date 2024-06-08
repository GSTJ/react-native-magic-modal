import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { magicModal } from "react-native-magic-modal";

const ScrollableModal: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text>My Scrollable Modal</Text>
        {Array.from({ length: 20 }).map((_, index) => (
          <Text style={styles.scrollItem} key={index}>
            Item {index + 1}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export const showScrollableModal = () => {
  return magicModal.show(() => <ScrollableModal />, {
    style: {
      justifyContent: "flex-end",
    },
    // This is important to make the modal scroll properly
    swipeDirection: undefined,
  });
};

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    gap: 16,
    margin: 32,
    maxHeight: "50%",
  },
  scrollView: {
    padding: 16,
  },
  scrollItem: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
});
