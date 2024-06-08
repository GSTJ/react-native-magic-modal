import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";

import { FullWindowOverlay } from "../FullWindowOverlay/FullWindowOverlay";
import { BackHandler, StyleSheet, View } from "react-native";
import {
  ModalProps,
  MagicModalHideTypes,
  GlobalHideFunction,
  GlobalShowFunction,
  ModalChildren,
  HookHideFunction,
} from "../../constants/types";
import { defaultConfig } from "../../constants/defaultConfig";
import { magicModalRef } from "../../utils/magicModalHandler";
import { MagicModal } from "./MagicModal";
import { MagicModalProvider } from "./MagicModalProvider";

const generatePseudoRandomID = () =>
  Math.random().toString(36).substring(7).toUpperCase() + Date.now();

type ModalQueueItem = {
  id: string;
  component: ModalChildren;
  config: ModalProps;
  hideFunction: HookHideFunction;
  hideCallback: (value: unknown) => void;
};

/**
 * @description A magic portal that should stay on the top of the app component hierarchy for the modal to be displayed.
 * @example
 * ```js
 * import { MagicModalPortal } from 'react-native-magic-modal';
 *
 * export default function App() {
 *   return (
 *     <SomeRandomProvider>
 *       <MagicModalPortal />  // <-- On the top of the app component hierarchy
 *       <Router /> // Your app router or something could follow below
 *     </SomeRandomProvider>
 *   );
 * }
 * ```
 */
export const MagicModalPortal: React.FC = memo(() => {
  const [modals, setModals] = React.useState<ModalQueueItem[]>([]);

  const hide = useCallback<GlobalHideFunction>(
    async (props, { modalID } = {}) => {
      if (!modals.length) {
        throw new Error("No modals visible to hide");
      }

      const currentModal = modals.find((modal) => modal.id === modalID);

      if (!modalID) {
        // eslint-disable-next-line no-console
        console.warn(
          "No modal id provided to hide. Defaulting to the last modal in the stack.\nPlease provide a modal id to hide or use the preferred useMagicModal hook inside the modal to hide itself."
        );
      } else if (!currentModal) {
        throw new Error(`No modal found with id: ${modalID}`);
      }

      const safeModal = currentModal || modals[modals.length - 1]!;

      setModals((prevModals) =>
        prevModals.filter((modal) => modal.id !== safeModal.id)
      );

      await new Promise<void>((resolve) => {
        setTimeout(resolve, safeModal.config.animationOutTiming);
      });

      safeModal.hideCallback(props);
    },
    [modals]
  );

  const show = useCallback<GlobalShowFunction>(
    async (newComponent, newConfig) => {
      const id = generatePseudoRandomID();

      let hideCallback: (value: unknown) => void = () => {};
      const hidePromise = new Promise((resolve) => {
        hideCallback = resolve;
      });

      const newModal = {
        id,
        component: newComponent,
        config: { ...defaultConfig, ...newConfig },
        hideCallback,
        hideFunction: (props) => hide(props, { modalID: id }),
      } satisfies ModalQueueItem;

      setModals((prevModals) => [...prevModals, newModal]);

      return hidePromise as Promise<undefined>;
    },
    [hide]
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const lastModal = modals[modals.length - 1];

        if (!lastModal) {
          return false;
        }

        if (lastModal.config.onBackButtonPress) {
          lastModal.config.onBackButtonPress();
        } else {
          hide(MagicModalHideTypes.BACK_BUTTON_PRESSED, {
            modalID: lastModal.id,
          });
        }

        return true;
      }
    );
    return () => backHandler.remove();
  }, [hide, modals]);

  useImperativeHandle(magicModalRef, () => ({
    show,
    hide,
  }));

  /* This needs to always be rendered, if we make it conditionally render based on ModalContent too,
     the modal will have zIndex issues on react-navigation modals. */
  return (
    <FullWindowOverlay>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {modals.map(({ id, component, config, hideFunction }) => (
          <MagicModalProvider key={id} hide={hideFunction}>
            <MagicModal config={config}>{component}</MagicModal>
          </MagicModalProvider>
        ))}
      </View>
    </FullWindowOverlay>
  );
});
