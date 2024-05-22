import { StyleSheet, ViewStyle } from "react-native";

interface IModalStyles {
  container: ViewStyle;
  overlay: ViewStyle;
}

export const styles = StyleSheet.create<IModalStyles>({
  container: {
    margin: 0,
  },
  overlay: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
