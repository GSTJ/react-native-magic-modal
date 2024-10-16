import Animated from "react-native-reanimated";

export type ModalChildren = React.FC;

export type Direction = "up" | "down" | "left" | "right";

export type HideReturn<T> =
  | {
      reason:
        | MagicModalHideReason.BACKDROP_PRESS
        | MagicModalHideReason.SWIPE_COMPLETE
        | MagicModalHideReason.BACK_BUTTON_PRESS
        | MagicModalHideReason.GLOBAL_HIDE_ALL;
    }
  | { reason: MagicModalHideReason.INTENTIONAL_HIDE; data: T };

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
   * If true, the modal will be displayed as a full window overlay on top of native iOS modal screens.
   * @default true
   * @platform ios
   */
  fullWindowOverlay: boolean;

  /**
   * Function to be called when the back button is pressed.
   * You can override it to prevent the modal from closing on back button press.
   * @default undefined
   * @example ({ hide }) => { console.log('Back button pressed'); hide({ reason: MagicModalHideReason.BACK_BUTTON_PRESS }); }
   */
  onBackButtonPress:
    | (({ hide }: { hide: HookHideFunction }) => void)
    | undefined;

  /**
   * Function to be called when the backdrop is pressed.
   * You can override it to prevent the modal from closing on backdrop press.
   * @default undefined
   * @example ({ hide }) => { console.log('Backdrop pressed'); hide({ reason: MagicModalHideReason.BACKDROP_PRESS }); }
   */
  onBackdropPress: (({ hide }: { hide: HookHideFunction }) => void) | undefined;

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

export type GlobalHideFunction = <T>(
  props: T,
  options?: { modalID?: string },
) => void;

export type GlobalHideAllFunction = () => void;

export type HookHideFunction = <T>(props: HideReturn<T>) => void;

export type NewConfigProps = Partial<ModalProps>;

export enum MagicModalHideReason {
  BACKDROP_PRESS = "BACKDROP_PRESS",
  SWIPE_COMPLETE = "SWIPE_COMPLETE",
  BACK_BUTTON_PRESS = "BACK_BUTTON_PRESS",
  INTENTIONAL_HIDE = "INTENTIONAL_HIDE",
  GLOBAL_HIDE_ALL = "GLOBAL_HIDE_ALL",
}

export type GlobalShowFunction = <T>(
  newComponent: ModalChildren,
  newConfig?: NewConfigProps,
) => {
  promise: Promise<HideReturn<T>>;
  modalID: string;
};
