import type { ElementType } from "react";

import { Fragment } from "react";

// FullWindowOverlay only exists to sit above native iOS modal screens. The
// browser implementation is a fragment, so its bundle has no native overlay
// dependency.
export const FullWindowOverlay: ElementType = Fragment;
