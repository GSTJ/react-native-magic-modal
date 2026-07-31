/** A component factory rendered as the body of a modal stack entry. */
export type ModalChildren = React.FC;

/**
 * Controls the entrance, exit, and optional swipe-to-dismiss direction.
 * Pass `undefined` as `swipeDirection` to disable swipe dismissal.
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * The discriminated result resolved by `magicModal.show<T>()`.
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

/**
 * Every modal option whose type is the same on every platform.
 *
 * The style-typed options are not here, because they are not the same: the
 * React Native entry types `style` as `StyleProp<ViewStyle>` and takes
 * Reanimated `entering`/`exiting` builders, while the browser entry types
 * `style` as `React.CSSProperties` and has no Reanimated to build from. Each
 * entry point declares its own `ModalProps` on top of this — see
 * `types.react-native.ts` and `types.browser.ts`.
 */
export type ModalConfigCommon = {
  /**
   * Accessible name announced for the modal container.
   *
   * Pass a localized, descriptive label. The library does not provide a
   * hard-coded default because that would be redundant with the dialog role
   * and impossible to localize correctly.
   * @default undefined
   * @example "Confirm account deletion"
   */
  accessibilityLabel: string | undefined;

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
   * Runs when Android back, web Escape, or the native accessibility escape
   * action asks the top modal to close. The handler can close the modal through
   * `hide` or leave it open.
   * @default undefined
   * @example ({ hide }) => hide({ reason: MagicModalHideReason.BACK_BUTTON_PRESS })
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
};

/**
 * The config the portal, the handler and the stack move around.
 *
 * Deliberately not the public `ModalProps`: nothing between `magicModal.show`
 * and the platform's chrome reads a style-typed option, so nothing in between
 * needs to know which platform's types are in play. The chrome that does read
 * them narrows this to its own entry's `ModalProps`.
 */
export type ModalProps = ModalConfigCommon & {
  style?: unknown;
  entering?: unknown;
  exiting?: unknown;
};

/**
 * What the portal hands each entry in the modal stack.
 *
 * `magic-modal.tsx` and `magic-modal.browser.tsx` both satisfy this, each with
 * its own `TConfig`; the portal is handed whichever one the platform's entry
 * point pulled in. The last two fields only ever move on the browser chrome —
 * see `createMagicModalPortal`.
 */
export type ModalStackEntryProps<TConfig extends ModalProps = ModalProps> = {
  children: ModalChildren;
  config: TConfig;
  /** True while the entry is dismissed but still playing its exit animation. */
  isExiting: boolean;
  isTopmost: boolean;
  /** Drops the entry from the stack. Call it once the exit has finished. */
  onExitFinished: () => void;
};

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

/**
 * Per-modal overrides accepted by `magicModal.show`.
 *
 * The exported one is per entry point, because {@link ModalProps} is. This is
 * the internal, platform-agnostic shape.
 */
export type NewConfigProps = Partial<ModalProps>;

/** Explains why a modal promise resolved. */
export enum MagicModalHideReason {
  /** The default backdrop handler closed the modal. */
  BACKDROP_PRESS = "BACKDROP_PRESS",
  /** A swipe exceeded the configured velocity threshold. */
  SWIPE_COMPLETE = "SWIPE_COMPLETE",
  /**
   * A system dismissal closed the modal: Android back, web Escape, or the
   * native accessibility escape action. The name is kept for compatibility.
   */
  BACK_BUTTON_PRESS = "BACK_BUTTON_PRESS",
  /** Modal code supplied data through a hide function. */
  INTENTIONAL_HIDE = "INTENTIONAL_HIDE",
  /** `magicModal.hideAll()` cleared the stack. */
  GLOBAL_HIDE_ALL = "GLOBAL_HIDE_ALL",
}

/**
 * What `magicModal.show<T>()` hands back: the modal's result promise, with the
 * controls for that stack entry hanging off it.
 *
 * Await it directly to get the {@link HideReturn}, or keep it around to drive
 * the modal while it is open.
 *
 * ```tsx
 * const handle = magicModal.show<Confirmation>(ConfirmationModal);
 * handle.update(() => <ConfirmationModal step={2} />);
 * const result = await handle;
 * ```
 *
 * The controls live on the promise object itself, so anything that adopts the
 * handle hands back a plain promise without them. Returning it from an `async`
 * function is the common case:
 *
 * ```tsx
 * // `modalID`, `update` and `hide` are gone from what the caller receives.
 * const open = async () => magicModal.show(ConfirmationModal);
 * ```
 *
 * Return the handle from a non-async function, or await it where you open it.
 */
export type ModalHandle<T> = Promise<HideReturn<T>> & {
  /** Identifies this stack entry for `magicModal.hide` and `magicModal.update`. */
  modalID: string;

  /** Swaps the content of this modal while it stays open. */
  update: (next: ModalChildren) => void;

  /**
   * Closes this modal from outside it, resolving the handle with
   * {@link MagicModalHideReason.INTENTIONAL_HIDE} and `data`. Inside modal
   * content, prefer `hide` from `useMagicModal`.
   */
  hide: (data?: T) => void;

  /**
   * @deprecated await the handle directly. Kept as an alias of the handle
   * itself so existing `const { promise } = magicModal.show(...)` code keeps
   * working.
   */
  promise: Promise<HideReturn<T>>;
};

export type GlobalShowFunction = <T>(
  newComponent: ModalChildren,
  newConfig?: NewConfigProps,
) => ModalHandle<T>;
