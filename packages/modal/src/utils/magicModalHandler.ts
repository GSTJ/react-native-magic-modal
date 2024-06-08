import React from "react";
import { GlobalHideFunction, GlobalShowFunction } from "../constants/types";

export const magicModalRef = React.createRef<IModal>();

/**
 * @description Show a modal. If a modal is already present, it will close it first before displaying.
 * @param newComponent Recieves a function that returns a modal component.
 * @param newConfig Recieves {@link NewConfigProps}  to override the default configs.
 * @returns Returns a Promise that resolves with the {@link hide} props when the Modal is closed. If it were closed automatically, without the manual use of  {@link hide}, the return would be one of {@link MagicModalHideTypes}
 */
const show: GlobalShowFunction = (newComponent, newConfig) => {
  if (!magicModalRef.current) {
    throw new Error(
      "MagicModalProvider not found. Please wrap your component with MagicModalProvider."
    );
  }

  return magicModalRef.current.show(newComponent, newConfig);
};
/**
 * @description Hide the current modal.
 * @param props Those props will be passed to the {@link show} resolve function.
 * @returns Returns a promise that resolves when the close animation is finished.
 */
const hide: GlobalHideFunction = async (props, { modalID } = {}) => {
  if (!magicModalRef.current) {
    throw new Error(
      "MagicModalProvider not found. Please wrap your component with MagicModalProvider."
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
 *  <TouchableOpacity onPress={() => magicModal.hide("hey")}>
 *    <Text>Test!</Text>
 *  </TouchableOpacity>
 * )
 *
 * const result = await magicModal.show(ExampleModal);
 * console.log(result); // Returns 'hey' when the modal is closed by the TouchableOpacity.
 * ```
 */
export const magicModal = {
  show,
  hide,
};
