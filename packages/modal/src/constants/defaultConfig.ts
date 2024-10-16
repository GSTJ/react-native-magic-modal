import { ANIMATION_DURATION_IN_MS } from "./animations";
import { ModalProps } from "./types";

export const defaultDirection = "down";

export const defaultConfig: ModalProps = {
  animationInTiming: ANIMATION_DURATION_IN_MS,
  animationOutTiming: ANIMATION_DURATION_IN_MS,
  hideBackdrop: false,
  backdropColor: "rgba(0, 0, 0, 0.5)",
  dampingFactor: 0.2,
  swipeDirection: defaultDirection,
  swipeVelocityThreshold: 500,
  onBackButtonPress: undefined,
  onBackdropPress: undefined,
  fullWindowOverlay: true,
  style: {},
} satisfies ModalProps;
