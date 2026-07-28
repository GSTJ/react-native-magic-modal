import { StyleSheet } from "react-native";

const BACKDROP_COLOR = "rgba(0, 0, 0, 0.5)";

export const styles = StyleSheet.create({
  pointerEventsBoxNone: {
    pointerEvents: "box-none",
  },
  childrenWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: BACKDROP_COLOR,
  },
  backdropContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
