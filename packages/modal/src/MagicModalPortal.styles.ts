import { StyleSheet, ViewStyle } from "react-native";

interface IModalStyles {
  container: ViewStyle;
  overlay: ViewStyle;
  backdrop: ViewStyle;
}

export const styles = StyleSheet.create<IModalStyles>({
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
});
