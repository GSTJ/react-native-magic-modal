export type ModalChildren = React.FC;

export type Direction = "top" | "bottom" | "left" | "right";

export type ModalProps = {
  /**
   * Duration of the animation when the modal is shown.
   * @default 300
   */
  animationInTiming: number;

  /**
   * Duration of the animation when the modal is hidden.
   * @default 300
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
   * @default undefined
   * @example () => { console.log('Back button pressed'); magicModal.hide(); }
   */
  onBackButtonPress: (() => void) | undefined;

  /**
   * Function to be called when the backdrop is pressed.
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
   * @default "bottom"
   * @example "top"
   */
  direction: Direction;

  /**
   * Velocity threshold for the swipe gesture.
   * @default 500
   */
  swipeVelocityThreshold: number;
};
export type GenericFunction = (props: any) => any;

export enum MagicModalHideTypes {
  BACKDROP_PRESSED = "BACKDROP_PRESSED",
  SWIPE_COMPLETED = "SWIPE_COMPLETED",
  BACK_BUTTON_PRESSED = "BACK_BUTTON_PRESSED",
  MODAL_OVERRIDE = "MODAL_OVERRIDE",
}
