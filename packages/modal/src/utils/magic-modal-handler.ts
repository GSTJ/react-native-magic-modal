import type {
  DisableFullWindowOverlayFunction,
  EnableFullWindowOverlayFunction,
  GlobalHideAllFunction,
  GlobalHideFunction,
  GlobalShowFunction,
} from "../constants/types";

import React from "react";

import {
  // HideReturn and ModalHandle are used in JS Doc
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  HideReturn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ModalHandle,
} from "../constants/types";

export const magicModalRef = React.createRef<IModal>();

const getMagicModal = (): NonNullable<typeof magicModalRef.current> => {
  if (!magicModalRef.current) {
    throw new Error(
      "MagicModalPortal not found. Please wrap your component with MagicModalPortal.",
    );
  }
  return magicModalRef.current;
};

const show: GlobalShowFunction = (newComponent, newConfig) => {
  return getMagicModal().show(newComponent, newConfig);
};

const hide: GlobalHideFunction = (props, { modalID } = {}) => {
  getMagicModal().hide(props, { modalID });
};

const enableFullWindowOverlay: EnableFullWindowOverlayFunction = () => {
  getMagicModal().enableFullWindowOverlay();
};

const disableFullWindowOverlay: DisableFullWindowOverlayFunction = () => {
  getMagicModal().disableFullWindowOverlay();
};

const hideAll: GlobalHideAllFunction = () => {
  // We recommend using this method in jest, and having throw because the ref was not found isn't useful there.
  // Not all tests are necessarily using the provider.
  return magicModalRef.current?.hideAll();
};
export type IModal = {
  show: typeof show;
  hide: typeof hide;
  hideAll: typeof hideAll;
  enableFullWindowOverlay: typeof enableFullWindowOverlay;
  disableFullWindowOverlay: typeof disableFullWindowOverlay;
};

/**
 * @example
 * ```tsx
 * import {
 *   MagicModalHideReason,
 *   magicModal,
 *   useMagicModal,
 * } from "magic-modal";
 *
 * const ExampleModal = () => {
 *   const { hide } = useMagicModal<{ message: string }>();
 *
 *   return (
 *     <Pressable onPress={() => hide({ message: "hey" })}>
 *       <Text>Close with data</Text>
 *     </Pressable>
 *   );
 * };
 *
 * const result = await magicModal.show<{ message: string }>(ExampleModal);
 *
 * if (result.reason === MagicModalHideReason.INTENTIONAL_HIDE) {
 *   console.log(result.data.message);
 * }
 * ```
 */
export const magicModal = {
  /**
   * @description Pushes a modal to the Stack, it will be displayed on top of the others.
   * @param newComponent Receives a function that returns a modal component.
   * @param newConfig Receives {@link NewConfigProps} to override the default configs.
   * @returns A {@link ModalHandle}: the promise that resolves with the {@link hide} props when the
   * Modal is closed (if it were closed automatically, without the manual use of {@link hide}, the
   * return would be one of {@link HideReturn}), carrying `modalID`, an `update` function that swaps
   * the modal's content while it stays open, a `hide` function that closes this entry, and a
   * deprecated `promise` alias of the handle itself.
   * @example
   * ```js
   * const result = await magicModal.show(() => <ExampleModal />);
   * ```
   * @example
   * ```js
   * const { update } = magicModal.show(() => <ExampleModal step={1} />);
   * update(() => <ExampleModal step={2} />);
   * ```
   * Prefer keeping state inside the modal component when you can. `update` is for data that
   * lives outside of it and can't reach in. The content is a new component, so it mounts from
   * scratch: anything the old one held in `useState` is gone.
   *
   * The controls hang off the promise, so awaiting the handle strips them. Returning it from an
   * `async` function gives the caller a plain promise: return it from a normal function, or await
   * it where the modal is opened.
   */
  show,
  /**
   * @description Hides the given modal. Prefer using `hide` from `useMagicModal`, as it already infers the modalID.
   * You should use the `magicModal.hide` function directly  only when calling from outside the modal.
   * @param props Those props will be passed to the {@link show} resolve function.
   * @param options Targets a specific stack entry by `modalID`. Omitting the ID falls back to the
   * topmost modal for backwards compatibility and is deprecated.
   */
  hide,
  /**
   * @description Hides all modals in the stack. This function should be used sparingly, as it's generally preferable to hide modals individually from within the modal itself.
   * However, this function can be useful in edge cases. It's also useful for test suites, such as calling hideAll in Jest's beforeEach function as a cleanup step.
   */
  hideAll,
  /**
   * @description Enables the full window overlay globally. This is useful for modals that need to be displayed on top of native iOS modal screens. The function is no-op on non-iOS platforms.
   * @example
   * ```js
   * magicModal.disableFullWindowOverlay();
   * await magicModal.show(() => <ExampleModal />);
   * magicModal.enableFullWindowOverlay();
   * ```
   * @platform ios
   */
  enableFullWindowOverlay,
  /**
   * @description Disables the full window overlay globally. This is useful for modals that do not need to be displayed on top of native iOS modal screens. The function is no-op on non-iOS platforms.
   * @example
   * ```js
   * magicModal.disableFullWindowOverlay();
   * await magicModal.show(() => <ExampleModal />);
   * magicModal.enableFullWindowOverlay();
   * ```
   * @platform ios
   */
  disableFullWindowOverlay,
};
