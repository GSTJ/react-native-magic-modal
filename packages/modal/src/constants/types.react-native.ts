import type { ModalConfigCommon } from "./types";
import type Animated from "react-native-reanimated";

import type { StyleProp, ViewStyle } from "react-native";

/**
 * The React Native entry's modal options.
 *
 * Everything platform-neutral comes from {@link ModalConfigCommon}. What is
 * added here is what only React Native can express: a `StyleProp<ViewStyle>`
 * and the two Reanimated builders. The browser entry declares the same three
 * names in `types.browser.ts` with web types, and each entry point ships its
 * own `.d.ts`, so an app only ever sees the one for the platform it resolved.
 */
export type ModalProps = ModalConfigCommon & {
  /**
   * Custom React Native style for the animated modal container.
   *
   * The browser entry types this as `React.CSSProperties` instead. See
   * {@link https://magic-modal.gabrieltaveira.dev/docs/platforms/nextjs the web guide}.
   * @default {}
   * @example { backgroundColor: 'red', padding: 10 }
   */
  style: StyleProp<ViewStyle>;

  /**
   * Reanimated entering animation for the modal content.
   *
   * React Native only. The browser entry has no Reanimated in it, so it plays
   * its own CSS-timed entrance built from `swipeDirection` and
   * `animationInTiming`, and does not accept this prop at all.
   * @default undefined
   * @platform ios, android
   */
  entering?: React.ComponentProps<typeof Animated.View>["entering"];

  /**
   * Reanimated exiting animation for the modal content.
   *
   * React Native only, and only on iOS and Android for the same reason as
   * {@link ModalProps.entering}.
   * @default undefined
   * @platform ios, android
   */
  exiting?: React.ComponentProps<typeof Animated.View>["exiting"];
};

/** Per-modal overrides accepted by `magicModal.show` on React Native. */
export type NewConfigProps = Partial<ModalProps>;
