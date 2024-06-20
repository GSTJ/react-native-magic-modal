import React from "react";

import {
  GlobalHideAllFunction,
  GlobalHideFunction,
  GlobalShowFunction,
  // HideReturn is used in JS Doc
  // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  HideReturn,
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
  return getMagicModal().hide(props, { modalID });
};

const hideAll: GlobalHideAllFunction = () => {
  // We recommend using this method in jest, and having throw because the ref was not found isn't useful there.
  // Not all tests are necessarily using the provider.
  return magicModalRef.current?.hideAll();
};
export interface IModal {
  show: typeof show;
  hide: typeof hide;
  hideAll: typeof hideAll;
}

/**
 * @example
 * ```js
 * // ...
 * import { magicModal } from 'react-native-magic-toast';
 *
 * // ...
 * const ExampleModal = () => (
 *  const { hide } = useMagicModal<{ message: string }>();
 *  <TouchableOpacity onPress={() => hide({ message: "hey" })}>
 *    <Text>Test!</Text>
 *  </TouchableOpacity>
 * )
 *
 * const result = magicModal.show(ExampleModal);
 * console.log(await result.promise); // Returns { reason: MagicModalHideReason.INTENTIONAL_HIDE, message: "hey" } when the modal is closed by the TouchableOpacity.
 * ```
 */
export const magicModal = {
  /**
   * @description Pushes a modal to the Stack, it will be displayed on top of the others.
   * @param newComponent Recieves a function that returns a modal component.
   * @param newConfig Recieves {@link NewConfigProps}  to override the default configs.
   * @returns Returns a Promise that resolves with the {@link hide} props when the Modal is closed. If it were closed automatically, without the manual use of {@link hide}, the return would be one of {@link HideReturn}
   */
  show,
  /**
   * @description Hides the given modal. Prefer using `hide` from `useMagicModal`, as it already infers the modalID.
   * You should use the `magicModal.hide` function directly  only when calling from outside the modal.
   * @param props Those props will be passed to the {@link show} resolve function.
   */
  hide,
  /**
   * @description Hides all modals in the stack. This function should be used sparingly, as it's generally preferable to hide modals individually from within the modal itself.
   * However, this function can be useful in edge cases. It's also useful for test suites, such as calling hideAll in Jest's beforeEach function as a cleanup step.
   */
  hideAll,
};
