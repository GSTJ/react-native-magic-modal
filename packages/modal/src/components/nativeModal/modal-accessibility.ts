import type { ViewProps } from "react-native";

/**
 * The React Native chrome's accessibility props.
 *
 * The same contract the browser chrome states in
 * `webModal/modal-accessibility.ts`, expressed in React Native props instead of
 * DOM attributes: `accessibilityElementsHidden` for VoiceOver,
 * `importantForAccessibility` for TalkBack, `onAccessibilityEscape` for the
 * iOS two-finger scrub, plus the `aria-*` names react-native-web reads.
 *
 * It is not shared with the browser chrome because none of those names mean
 * anything to a `div`, and passing them to one makes React complain about
 * unknown attributes.
 */

export const getStackEntryAccessibilityProps = (
  isTopmost: boolean,
): Pick<
  ViewProps,
  | "accessibilityElementsHidden"
  | "aria-hidden"
  | "importantForAccessibility"
  | "pointerEvents"
> => ({
  accessibilityElementsHidden: !isTopmost,
  "aria-hidden": !isTopmost,
  importantForAccessibility: isTopmost ? "auto" : "no-hide-descendants",
  pointerEvents: isTopmost ? "box-none" : "none",
});

export const getDialogAccessibilityProps = ({
  accessibilityLabel,
  isTopmost,
  onSystemDismiss,
}: {
  accessibilityLabel: string | undefined;
  isTopmost: boolean;
  onSystemDismiss: () => void;
}): Pick<
  ViewProps,
  | "accessibilityLabel"
  | "accessibilityViewIsModal"
  | "aria-modal"
  | "importantForAccessibility"
  | "onAccessibilityEscape"
  | "role"
  | "tabIndex"
> => ({
  accessibilityLabel: isTopmost ? accessibilityLabel : undefined,
  accessibilityViewIsModal: isTopmost,
  "aria-modal": isTopmost ? true : undefined,
  importantForAccessibility: isTopmost ? "auto" : "no-hide-descendants",
  onAccessibilityEscape: isTopmost ? onSystemDismiss : undefined,
  role: isTopmost ? "dialog" : undefined,
  tabIndex: isTopmost ? -1 : undefined,
});
