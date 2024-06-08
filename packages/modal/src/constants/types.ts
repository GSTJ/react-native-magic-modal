import Animated from "react-native-reanimated";

export type ModalChildren = React.FC;

export type Direction = "up" | "down" | "left" | "right";

export type ModalProps = {
  /**
   * Duration of the animation when the modal is shown.
   * @default 250
   */
  animationInTiming: number;

  /**
   * Duration of the animation when the modal is hidden.
   * @default 250
   */
  animationOutTiming: number;

  /**
   * If true, the backdrop will be hidden.
   * @default false
   */
  hideBackdrop: boolean;

  /**
   * The color of the backdrop.
   * @default "rgba(0, 0, 0, 0.5)"
   */
  backdropColor: string;

  /**
   * Function to be called when the back button is pressed.
   * You can override it to prevent the modal from closing on back button press.
   * @default undefined
   * @example () => { console.log('Back button pressed'); magicModal.hide(); }
   */
  onBackButtonPress: (() => void) | undefined;

  /**
   * Function to be called when the backdrop is pressed.
   * You can override it to prevent the modal from closing on backdrop press.
   * @default undefined
   * @example () => { console.log('Backdrop pressed'); magicModal.hide(); }
   */
  onBackdropPress: (() => void) | undefined;

  /**
   * Custom style for the modal.
   * @default {}
   * @example { backgroundColor: 'red', padding: 10 }
   */
  style: Record<string, unknown>;

  /**
   * Damping factor for the swipe gesture.
   * @default 0.2
   */
  dampingFactor: number;

  /**
   * Direction of the modal animation.
   * Set to undefined to disable the swipe gesture.
   * @default "down"
   * @example "up"
   */
  swipeDirection: Direction | undefined;

  /**
   * Velocity threshold for the swipe gesture.
   * @default 500
   */
  swipeVelocityThreshold: number;
} & Pick<React.ComponentProps<typeof Animated.View>, "entering" | "exiting">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericFunction = (props: any) => any;

export type GlobalHideFunction = (
  props?: unknown,
  options?: { modalID?: string },
) => void;

export type HookHideFunction = (props?: unknown) => void;

export type NewConfigProps = Partial<ModalProps>;

export type GlobalShowFunction = <T>(
  newComponent: ModalChildren,
  newConfig?: NewConfigProps,
) => { promise: Promise<T | undefined>; modalID: string };

export enum MagicModalHideTypes {
  BACKDROP_PRESSED = "BACKDROP_PRESSED",
  SWIPE_COMPLETED = "SWIPE_COMPLETED",
  BACK_BUTTON_PRESSED = "BACK_BUTTON_PRESSED",
  MODAL_OVERRIDE = "MODAL_OVERRIDE",
}
