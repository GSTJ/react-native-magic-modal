/* eslint-disable @typescript-eslint/no-var-requires */
import { Fragment } from "react";
import { Platform } from "react-native";

/** Don't use .ios file extension as bunchee can't bundle it properly */
export const FullWindowOverlay =
  Platform.OS === "ios"
    ? require("react-native-screens").FullWindowOverlay
    : Fragment;
