import type { ElementType } from "react";

import { Platform } from "react-native";

// A namespace import prevents the package build from rewriting this public
// entrypoint to a private react-native-screens source path.
// eslint-disable-next-line import/no-namespace -- see above
import * as ReactNativeScreens from "react-native-screens";

export const FullWindowOverlay: ElementType =
  ReactNativeScreens.FullWindowOverlay;

/**
 * react-native-screens' `FullWindowOverlay` is what puts the portal above a
 * native iOS modal screen. It exists nowhere else.
 *
 * The `Platform` check lives here, next to the capability it guards, so the
 * portal — which the browser shares — does not need one.
 */
export const isFullWindowOverlaySupported = Platform.OS === "ios";
