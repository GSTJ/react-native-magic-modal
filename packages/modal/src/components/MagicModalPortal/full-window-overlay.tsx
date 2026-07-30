import type { ElementType } from "react";

// A namespace import prevents the package build from rewriting this public
// entrypoint to a private react-native-screens source path.
// eslint-disable-next-line import/no-namespace -- see above
import * as ReactNativeScreens from "react-native-screens";

export const FullWindowOverlay: ElementType =
  ReactNativeScreens.FullWindowOverlay;
