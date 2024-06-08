import React from "react";

import { GlobalHideFunction, GlobalShowFunction } from "../constants/types";

export const magicModalRef = React.createRef<IModal>();

/**
 * @description Pushes a modal to the Stack, it will be displayed on top of the others.
 * @param newComponent Recieves a function that returns a modal component.
 * @param newConfig Recieves {@link NewConfigProps}  to override the default configs.
 * @returns Returns a Promise that resolves with the {@link hide} props when the Modal is closed. If it were closed automatically, without the manual use of {@link hide}, the return would be one of {@link MagicModalHideTypes}
 */
const show: GlobalShowFunction = (newComponent, newConfig) => {
  if (!magicModalRef.current) {
    throw new Error(
      "MagicModalProvider not found. Please wrap your component with MagicModalProvider.",
    );
  }

  return magicModalRef.current.show(newComponent, newConfig);
};
/**
 * @description Hides the given modal. Prefer using `hide` from `useMagicModal`, as it already infers the modalID.
 * You should use the `magicModal.hide`function directly  only when calling from outside the modal.
 * @param props Those props will be passed to the {@link show} resolve function.
 */
const hide: GlobalHideFunction = async (props, { modalID } = {}) => {
  if (!magicModalRef.current) {
    throw new Error(
      "MagicModalProvider not found. Please wrap your component with MagicModalProvider.",
    );
  }

  return magicModalRef.current.hide(props, { modalID });
};
export interface IModal {
  show: typeof show;
  hide: typeof hide;
}

/**
 * @example
 * ```js
 * // ...
 * import { magicModal } from 'react-native-magic-toast';
 *
 * // ...
 * const ExampleModal = () => (
 *  const { hide } = useMagicModal();
 *  <TouchableOpacity onPress={() => hide("hey")}>
 *    <Text>Test!</Text>
 *  </TouchableOpacity>
 * )
 *
 * const result = magicModal.show(ExampleModal);
 * console.log(await result.promise); // Returns 'hey' when the modal is closed by the TouchableOpacity.
 * ```
 */
export const magicModal = {
  show,
  hide,
};
