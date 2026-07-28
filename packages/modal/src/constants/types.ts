import type Animated from "react-native-reanimated";

import type { StyleProp, ViewStyle } from "react-native";

/** A component factory rendered as the body of a modal stack entry. */
export type ModalChildren = React.FC;

/**
 * Controls the entrance, exit, and optional swipe-to-dismiss direction.
 * Pass `undefined` as `swipeDirection` to disable swipe dismissal.
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * The discriminated result resolved by `magicModal.show<T>().promise`.
 * `data` exists only when the modal was intentionally hidden.
 */
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
   * Hides the backdrop and removes its press target.
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
   * Custom React Native style for the animated modal container.
   * @default {}
   * @example { backgroundColor: 'red', padding: 10 }
   */
  style: StyleProp<ViewStyle>;

  /**
   * Damping factor for the swipe gesture.
   * @default 0.2
   */
  dampingFactor: number;

  /**
   * Direction of the default modal animation and swipe-to-dismiss gesture.
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

/**
 * Swaps the content of the modal it came from. Returned by {@link GlobalShowFunction}.
 */
export type ModalUpdateFunction = (newComponent: ModalChildren) => void;

export type GlobalUpdateFunction = (
  newComponent: ModalChildren,
  options: { modalID: string },
) => void;

export type EnableFullWindowOverlayFunction = () => void;

export type DisableFullWindowOverlayFunction = () => void;

export type HookHideFunction = <T>(props: HideReturn<T>) => void;

/** Per-modal overrides accepted by `magicModal.show`. */
export type NewConfigProps = Partial<ModalProps>;

/** Explains why a modal promise resolved. */
export enum MagicModalHideReason {
  /** The default backdrop handler closed the modal. */
  BACKDROP_PRESS = "BACKDROP_PRESS",
  /** A swipe exceeded the configured velocity threshold. */
  SWIPE_COMPLETE = "SWIPE_COMPLETE",
  /** Android's system back action closed the modal. */
  BACK_BUTTON_PRESS = "BACK_BUTTON_PRESS",
  /** Modal code supplied data through a hide function. */
  INTENTIONAL_HIDE = "INTENTIONAL_HIDE",
  /** `magicModal.hideAll()` cleared the stack. */
  GLOBAL_HIDE_ALL = "GLOBAL_HIDE_ALL",
}

export type GlobalShowFunction = <T>(
  newComponent: ModalChildren,
  newConfig?: NewConfigProps,
) => {
  promise: Promise<HideReturn<T>>;
  modalID: string;
  update: ModalUpdateFunction;
};
