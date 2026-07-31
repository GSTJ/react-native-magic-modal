import type { ElementType } from "react";

import { Fragment } from "react";

// FullWindowOverlay only exists to sit above native iOS modal screens. The
// browser implementation is a fragment that is never reached, so its bundle has
// no native overlay dependency and no Platform check to decide it needs none.
export const FullWindowOverlay: ElementType = Fragment;

export const isFullWindowOverlaySupported = false;
