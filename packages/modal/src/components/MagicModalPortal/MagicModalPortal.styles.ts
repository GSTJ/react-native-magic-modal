import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    margin: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
