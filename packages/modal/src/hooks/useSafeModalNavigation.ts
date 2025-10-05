import { Platform } from "react-native";
import { useMagicModal } from "../components/MagicModalProvider";
import { ANDROID_NAVIGATION_DELAY } from "../constants/androidConfig";

/**
 * Hook that provides safe navigation methods when closing modals
 * Addresses Issue #155 - Android crash when navigating immediately after hide
 */
export function useSafeModalNavigation() {
  const { hide } = useMagicModal();

  const hideAndNavigate = (navigateCallback: () => void) => {
    if (Platform.OS === "android") {
      // On Android, ensure modal is fully hidden before navigating
      hide();
      setTimeout(() => {
        navigateCallback();
      }, ANDROID_NAVIGATION_DELAY);
    } else {
      // On iOS and other platforms, can navigate immediately
      hide();
      navigateCallback();
    }
  };

  const hideAndNavigateAsync = async (navigateCallback: () => Promise<void>) => {
    if (Platform.OS === "android") {
      hide();
      await new Promise(resolve => setTimeout(resolve, ANDROID_NAVIGATION_DELAY));
      await navigateCallback();
    } else {
      hide();
      await navigateCallback();
    }
  };

  return {
    hide,
    hideAndNavigate,
    hideAndNavigateAsync,
  };
}