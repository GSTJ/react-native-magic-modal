import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { BackHandler, StyleSheet, View } from "react-native";

import { defaultConfig } from "../../constants/defaultConfig";
import {
  GlobalHideFunction,
  GlobalShowFunction,
  MagicModalHideReason,
  ModalChildren,
  ModalProps,
} from "../../constants/types";
import { magicModalRef } from "../../utils/magicModalHandler";
import { FullWindowOverlay } from "../FullWindowOverlay/FullWindowOverlay";
import { MagicModal } from "../MagicModal";
import { MagicModalProvider } from "../MagicModalProvider";

const generatePseudoRandomID = () =>
  Math.random().toString(36).substring(7).toUpperCase() + Date.now();

type ModalStackItem = {
  id: string;
  component: ModalChildren;
  config: ModalProps;
  hideCallback: (value: unknown) => void;
  hideFunction: (props: unknown) => void;
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
  const [modals, setModals] = React.useState<ModalStackItem[]>([]);

  const _hide = useCallback<GlobalHideFunction>(
    async (props, { modalID } = {}) => {
      setModals((prevModals) => {
        const currentModal = prevModals.find((modal) => modal.id === modalID);

        if (!modalID) {
          // eslint-disable-next-line no-console
          console.warn(
            "[DEPRECATED] react-native-magic-modal deprecated 'hide' usage:\nCalling magicModal.hide without a modal ID is deprecated and will be removed in future versions.\nPlease provide a modal id to hide or use the preferred `useMagicModal` hook inside the modal to hide itself.\nDefaulting to hiding the last modal in the stack.",
          );
        } else if (!currentModal) {
          // eslint-disable-next-line no-console
          console.log(
            `[HIDE EVENT IGNORED] No modal found with id: ${modalID}. It might have already been hidden.`,
          );
          return prevModals;
        }

        if (prevModals.length === 0) {
          // eslint-disable-next-line no-console
          console.log(
            `[HIDE EVENT IGNORED] No modals found in the stack to hide. It might have already been hidden.`,
          );
          return prevModals;
        }

        const safeModal = currentModal || prevModals[prevModals.length - 1]!;

        safeModal.hideCallback(props);

        return prevModals.filter((modal) => modal.id !== safeModal.id);
      });
    },
    [],
  );

  const show = useCallback<GlobalShowFunction>(
    (newComponent, newConfig) => {
      const modalID = generatePseudoRandomID();

      let hideCallback: (value: unknown) => void = () => {};
      const hidePromise = new Promise((resolve) => {
        hideCallback = resolve;
      });

      const newModal = {
        id: modalID,
        component: newComponent,
        config: { ...defaultConfig, ...newConfig },
        hideCallback,
        hideFunction: (props) => _hide(props, { modalID }),
      } satisfies ModalStackItem;

      setModals((prevModals) => [...prevModals, newModal]);

      return {
        // This is already typed by the GlobalShowFunction type Generic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        promise: hidePromise as any,
        modalID,
      } as const;
    },
    [_hide],
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
          lastModal.config.onBackButtonPress({
            hide: (props) => _hide(props, { modalID: lastModal.id }),
          });
        } else {
          _hide(
            { reason: MagicModalHideReason.BACK_BUTTON_PRESS },
            { modalID: lastModal.id },
          );
        }

        return true;
      },
    );
    return () => backHandler.remove();
  }, [_hide, modals]);

  const hide = useCallback<GlobalHideFunction>(
    (props, { modalID } = {}) =>
      _hide(
        { reason: MagicModalHideReason.INTENTIONAL_HIDE, data: props },
        { modalID },
      ),
    [_hide],
  );

  const hideAll = useCallback(() => {
    setModals((prevModals) => {
      prevModals.forEach((modal) => {
        modal.hideCallback({ reason: MagicModalHideReason.GLOBAL_HIDE_ALL });
      });
      return [];
    });
  }, []);

  useImperativeHandle(magicModalRef, () => ({
    show,
    hide,
    hideAll,
  }));

  const modalList = useMemo(() => {
    return modals.map(({ id, component, config, hideFunction }) => (
      <MagicModalProvider key={id} hide={hideFunction}>
        <MagicModal config={config}>{component}</MagicModal>
      </MagicModalProvider>
    ));
  }, [modals]);

  /* This needs to always be rendered, if we make it conditionally render based on ModalContent too,
     the modal will have zIndex issues on react-navigation modals. */
  return (
    <FullWindowOverlay>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {modalList}
      </View>
    </FullWindowOverlay>
  );
});
