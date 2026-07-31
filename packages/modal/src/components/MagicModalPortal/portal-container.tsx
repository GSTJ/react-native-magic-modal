import type { PortalContainerProps } from "./magic-modal-portal-base";

import React from "react";
import { StyleSheet, View } from "react-native";

/** The React Native portal container: a full-bleed, press-transparent `View`. */
export const PortalContainer = ({
  children,
  hasLiveModals,
}: PortalContainerProps) => (
  <View
    accessibilityElementsHidden={!hasLiveModals}
    accessibilityViewIsModal={hasLiveModals}
    aria-hidden={!hasLiveModals}
    importantForAccessibility={hasLiveModals ? "auto" : "no-hide-descendants"}
    style={[StyleSheet.absoluteFill, styles.wrapper]}
    testID="magic-modal-portal"
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    pointerEvents: "box-none",
  },
});
