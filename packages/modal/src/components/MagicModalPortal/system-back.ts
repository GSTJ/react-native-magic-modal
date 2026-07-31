import type { SystemBackSubscription } from "./magic-modal-portal-base";

import { BackHandler, Platform } from "react-native";

/**
 * Android's hardware back button.
 *
 * Nothing subscribes on the web, where `BackHandler` is a stub and the browser
 * equivalent — Escape — is handled by the modal's focus trap instead. That
 * check is here rather than in the portal so the browser bundle, which uses
 * `system-back.browser.ts`, needs no `Platform` to make it.
 */
export const subscribeToSystemBack: SystemBackSubscription = (onSystemBack) => {
  if (Platform.OS === "web") {
    return () => {};
  }

  const subscription = BackHandler.addEventListener(
    "hardwareBackPress",
    onSystemBack,
  );

  return () => {
    subscription.remove();
  };
};
