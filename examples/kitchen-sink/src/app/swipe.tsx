/* eslint-disable react-native/no-color-literals */
import type { Direction } from "react-native-magic-modal";

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { magicModal, MagicModalHideReason } from "react-native-magic-modal";

import { ExampleModal } from "@/components/example-modal";

const directions = ["up", "down", "left", "right"] as const;

const initialReasons = {
  up: "none",
  down: "none",
  left: "none",
  right: "none",
} satisfies Record<Direction, string>;

/**
 * Swipe-to-dismiss harness. The home screen's "Show Modal" picks a random
 * direction and closes itself on a timer, which is fine for a demo and useless
 * for a test. Each button here opens a modal pinned to one direction and leaves
 * it open until something dismisses it.
 *
 * The hide reason is rendered per direction rather than as a single "last
 * reason" line. A Maestro flow can then assert that the modal it opened is the
 * one that got dismissed, and one screenshot covers all four directions.
 */
const SwipeScreen = () => {
  const [reasons, setReasons] =
    React.useState<Record<Direction, string>>(initialReasons);

  const showSwipeModal = async (swipeDirection: Direction) => {
    setReasons((previous) => ({ ...previous, [swipeDirection]: "pending" }));

    const result = await magicModal.show(() => <ExampleModal />, {
      swipeDirection,
    });

    setReasons((previous) => ({
      ...previous,
      [swipeDirection]: result.reason,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Swipe To Dismiss</Text>
      {directions.map((direction) => (
        <Pressable
          key={direction}
          testID={`swipe-${direction}-button`}
          accessibilityRole="button"
          accessibilityLabel={`Swipe ${direction}`}
          accessible
          style={styles.button}
          onPress={() => {
            void showSwipeModal(direction);
          }}
        >
          <Text style={styles.buttonText}>Swipe {direction}</Text>
        </Pressable>
      ))}
      <View style={styles.results}>
        {directions.map((direction) => (
          <Text key={direction} testID={`swipe-${direction}-reason`} accessible>
            {`${direction}: ${reasons[direction]}`}
          </Text>
        ))}
      </View>
      <Text style={styles.legend}>
        {`A completed swipe reports ${MagicModalHideReason.SWIPE_COMPLETE}.`}
      </Text>
    </View>
  );
};

export default SwipeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
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
  results: {
    alignItems: "center",
    gap: 2,
  },
  legend: {
    fontSize: 12,
    color: "#666666",
  },
});
