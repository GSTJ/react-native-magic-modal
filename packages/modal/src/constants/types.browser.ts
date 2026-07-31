import type { ModalConfigCommon } from "./types";

import type { CSSProperties } from "react";

/**
 * The browser entry's modal options.
 *
 * Everything platform-neutral comes from {@link ModalConfigCommon}. `style` is
 * the only addition, and it is CSS, because the browser chrome renders plain
 * DOM elements and hands this straight to a `style` attribute. There is no
 * react-native-web underneath to translate React Native styles any more.
 *
 * The Reanimated `entering` and `exiting` builders are not here. They never did
 * anything on the web, and there is no Reanimated in this bundle to build one
 * with.
 */
export type ModalProps = ModalConfigCommon & {
  /**
   * Custom CSS for the modal container.
   *
   * Applied as an inline `style` attribute on the modal's own layout box, so
   * anything the browser accepts works: `position: "fixed"`, `gridTemplate`,
   * `inset`, custom properties.
   *
   * **Breaking change in v10.1.** This used to be `StyleProp<ViewStyle>`, the
   * React Native style type, which react-native-web translated at runtime.
   * React Native style objects are not CSS and are no longer accepted:
   * - style arrays: pass one object, or spread them yourself.
   * - React Native-only shorthands: `paddingHorizontal: 16` becomes
   *   `paddingInline: 16` (or `padding: "0 16px"`), `marginVertical`,
   *   `shadow*` and `elevation` become `boxShadow`.
   * - unitless numbers still work, exactly as they do in React: `padding: 10`
   *   is `10px`.
   *
   * The React Native entry still types this as `StyleProp<ViewStyle>`.
   * @default {}
   * @example { background: "white", borderRadius: 20, padding: 24 }
   */
  style: CSSProperties;
};

/** Per-modal overrides accepted by `magicModal.show` in the browser. */
export type NewConfigProps = Partial<ModalProps>;
