import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";
/** Do not import FullWindowOverlay from react-native-screens directly, as it screws up code splitting */
import FullWindowOverlay from "react-native-screens/src/components/FullWindowOverlay";

import type {
  GlobalHideFunction,
  GlobalShowFunction,
  ModalChildren,
  ModalProps,
} from "../../constants/types";
import { defaultConfig } from "../../constants/defaultConfig";
import { MagicModalHideReason } from "../../constants/types";
import { magicModalRef } from "../../utils/magicModalHandler";
import { MagicModal } from "../MagicModal";
import { MagicModalProvider } from "../MagicModalProvider";

const generatePseudoRandomID = () =>
  Math.random().toString(36).substring(7).toUpperCase() + Date.now().toString();

interface ModalStackItem {
  id: string;
  component: ModalChildren;
  config: ModalProps;
  hideCallback: (value: unknown) => void;
  hideFunction: (props: unknown) => void;
}
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
  const [fullWindowOverlayEnabled, setFullWindowOverlayEnabled] =
    React.useState(true);

  const disableFullWindowOverlay = useCallback(() => {
    setFullWindowOverlayEnabled(false);
  }, []);

  const enableFullWindowOverlay = useCallback(() => {
    setFullWindowOverlayEnabled(true);
  }, []);

  const _hide = useCallback<GlobalHideFunction>((props, { modalID } = {}) => {
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

      const safeModal = currentModal ?? prevModals[prevModals.length - 1];

      safeModal?.hideCallback(props);

      return prevModals.filter((modal) => modal.id !== safeModal?.id);
    });
  }, []);

  const show = useCallback<GlobalShowFunction>(
    (newComponent, newConfig) => {
      const modalID = generatePseudoRandomID();

      let hideCallback: (value: unknown) => void = () => {
        // Empty function
      };
      const hidePromise = new Promise((resolve) => {
        hideCallback = resolve;
      });

      const newModal = {
        id: modalID,
        component: newComponent,
        config: { ...defaultConfig, ...newConfig },
        hideCallback,
        hideFunction: (props) => {
          _hide(props, { modalID });
        },
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
            hide: (props) => {
              _hide(props, { modalID: lastModal.id });
            },
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
    return () => {
      backHandler.remove();
    };
  }, [_hide, modals]);

  const hide = useCallback<GlobalHideFunction>(
    (props, { modalID } = {}) => {
      _hide(
        { reason: MagicModalHideReason.INTENTIONAL_HIDE, data: props },
        { modalID },
      );
    },
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
    disableFullWindowOverlay,
    enableFullWindowOverlay,
  }));

  const modalList = useMemo(() => {
    return modals.map(({ id, component, config, hideFunction }) => {
      return (
        <MagicModalProvider key={id} hide={hideFunction}>
          <MagicModal config={config}>{component}</MagicModal>
        </MagicModalProvider>
      );
    });
  }, [modals]);

  const Overlay =
    fullWindowOverlayEnabled && Platform.OS === "ios"
      ? FullWindowOverlay
      : React.Fragment;

  /* This needs to always be rendered, if we make it conditionally render based on ModalContent too,
     the modal will have zIndex issues on react-navigation modals. */
  return (
    <Overlay>
      <View style={[StyleSheet.absoluteFill, styles.wrapper]}>{modalList}</View>
    </Overlay>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    pointerEvents: "box-none",
  },
});
