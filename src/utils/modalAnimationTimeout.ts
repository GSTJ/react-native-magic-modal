import { ANIMATION_DURATION_IN_MS } from '../constants/animations';

export const modalAnimationTimeout = () =>
  new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION_IN_MS));
