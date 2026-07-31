import type {
  GlobalHideFunction,
  GlobalShowFunction,
  GlobalUpdateFunction,
  HideReturn,
  ModalChildren,
  ModalHandle,
  ModalProps,
  ModalStackEntryProps,
  ModalUpdateFunction,
  NewConfigProps,
} from "../../constants/types";

import type { ComponentType, ElementType } from "react";

import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";

import { defaultConfig } from "../../constants/default-config";
import { MagicModalHideReason } from "../../constants/types";
import { magicModalRef } from "../../utils/magic-modal-handler";
import { MagicModalProvider } from "../magic-modal-provider";

const generatePseudoRandomID = () =>
  Math.random().toString(36).slice(7).toUpperCase() + Date.now().toString();

export type ModalStackItem = {
  id: string;
  component: ModalChildren;
  config: ModalProps;
  hideCallback: (value: unknown) => void;
  hideFunction: (props: unknown) => void;
  /**
   * Set by a `leaveStack` that wants the entry to stick around after it was
   * dismissed. It is out of the stack for every other purpose from that point
   * on: it can't be topmost, hidden again, or updated.
   */
  isExiting?: boolean;
};

/**
 * What happens to an entry the moment it is dismissed.
 *
 * The React Native chrome has no exit animation, so it drops out of the stack
 * on the spot. The browser chrome plays one, and a component that React has
 * already unmounted cannot animate, so the browser portal swaps in a strategy
 * that marks the entry instead and waits for `onExitFinished`.
 */
export type ModalStackLeave = (
  modals: ModalStackItem[],
  leaving: ModalStackItem,
) => ModalStackItem[];

const dropImmediately: ModalStackLeave = (modals, leaving) =>
  modals.filter((modal) => modal.id !== leaving.id);

const getLiveModals = (modals: ModalStackItem[]) =>
  modals.filter((modal) => !modal.isExiting);

/**
 * Hangs the stack-entry controls off the modal's own promise, so callers can
 * `await magicModal.show(...)` and still reach `modalID`, `update` and `hide`.
 *
 * `promise` points back at the handle: it is the deprecated alias that keeps
 * `const { promise } = magicModal.show(...)` working.
 */
const createModalHandle = <T,>(
  promise: Promise<HideReturn<T>>,
  controls: {
    modalID: string;
    update: ModalUpdateFunction;
    hide: (data?: T) => void;
  },
): ModalHandle<T> => {
  // `Object.assign` returns the intersection, which is every part of
  // `ModalHandle` except the self-referential `promise` assigned below.
  const handle = Object.assign(promise, controls) as ModalHandle<T>;
  handle.promise = handle;
  return handle;
};
/**
 * @description A magic portal that should stay on the top of the app component hierarchy for the modal to be displayed.
 * @example
 * Mount exactly one portal, after the app content, inside `GestureHandlerRootView`.
 *
 * ```tsx
 * import { GestureHandlerRootView } from "react-native-gesture-handler";
 * import { MagicModalPortal } from 'react-native-magic-modal';
 *
 * export default function App() {
 *   return (
 *     <GestureHandlerRootView style={{ flex: 1 }}>
 *       <SomeRandomProvider>
 *         <Router />
 *         <MagicModalPortal />
 *       </SomeRandomProvider>
 *     </GestureHandlerRootView>
 *   );
 * }
 * ```
 */
export const createMagicModalPortal = ({
  FullWindowOverlay,
  StackEntry,
  leaveStack = dropImmediately,
}: {
  FullWindowOverlay: ElementType;
  /**
   * The platform's modal chrome. Injected rather than imported so the browser
   * bundle never reaches the Reanimated and gesture-handler one.
   */
  StackEntry: ComponentType<ModalStackEntryProps>;
  leaveStack?: ModalStackLeave;
}): React.FC =>
  memo(() => {
    const [modals, setModals] = React.useState<ModalStackItem[]>([]);
    const [fullWindowOverlayEnabled, setFullWindowOverlayEnabled] =
      React.useState(true);

    const disableFullWindowOverlay = useCallback(() => {
      setFullWindowOverlayEnabled(false);
    }, []);

    const enableFullWindowOverlay = useCallback(() => {
      setFullWindowOverlayEnabled(true);
    }, []);

    const removeModal = useCallback((modalID: string) => {
      setModals((prevModals) =>
        prevModals.filter((modal) => modal.id !== modalID),
      );
    }, []);

    const _hide = useCallback<GlobalHideFunction>(
      (props, { modalID } = {}) => {
        setModals((prevModals) => {
          const liveModals = getLiveModals(prevModals);
          const currentModal = liveModals.find((modal) => modal.id === modalID);

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

          if (liveModals.length === 0) {
            // eslint-disable-next-line no-console
            console.log(
              `[HIDE EVENT IGNORED] No modals found in the stack to hide. It might have already been hidden.`,
            );
            return prevModals;
          }

          const safeModal = currentModal ?? liveModals.at(-1);

          if (!safeModal) {
            return prevModals;
          }

          safeModal.hideCallback(props);

          return leaveStack(prevModals, safeModal);
        });
      },
      // `leaveStack` closes over `createMagicModalPortal`'s argument, which is
      // fixed for the lifetime of the component this returns. It is not a
      // render value, so it is not a dependency.
      [],
    );

    const update = useCallback<GlobalUpdateFunction>(
      (newComponent, { modalID }) => {
        setModals((prevModals) => {
          const currentModal = getLiveModals(prevModals).find(
            (modal) => modal.id === modalID,
          );

          if (!currentModal) {
            // eslint-disable-next-line no-console
            console.log(
              `[UPDATE EVENT IGNORED] No modal found with id: ${modalID}. It might have already been hidden.`,
            );
            return prevModals;
          }

          if (currentModal.component === newComponent) {
            return prevModals;
          }

          return prevModals.map((modal) =>
            modal.id === modalID
              ? { ...modal, component: newComponent }
              : modal,
          );
        });
      },
      [],
    );

    const show = useCallback<GlobalShowFunction>(
      // Written generic rather than relying on the contextual type, so `T`
      // has a name inside and the handle can be built without casting it.
      <T,>(
        newComponent: ModalChildren,
        newConfig?: NewConfigProps,
      ): ModalHandle<T> => {
        const modalID = generatePseudoRandomID();

        let hideCallback: (value: unknown) => void = () => {
          // Empty function
        };
        // The stack is payload-agnostic: it resolves whatever the hide caller
        // passed, and `T` is what the caller declared that payload to be.
        const hidePromise = new Promise<HideReturn<T>>((resolve) => {
          hideCallback = resolve as (value: unknown) => void;
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

        return createModalHandle<T>(hidePromise, {
          modalID,
          update: (updatedComponent) => {
            update(updatedComponent, { modalID });
          },
          hide: (data) => {
            // Same wiring the `useMagicModal` hook uses from inside the modal.
            newModal.hideFunction({
              reason: MagicModalHideReason.INTENTIONAL_HIDE,
              data,
            });
          },
        });
      },
      [_hide, update],
    );

    useEffect(() => {
      if (Platform.OS === "web") {
        return;
      }

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          const lastModal = getLiveModals(modals).at(-1);

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
      setModals((prevModals) =>
        getLiveModals(prevModals).reduce((remaining, modal) => {
          modal.hideCallback({ reason: MagicModalHideReason.GLOBAL_HIDE_ALL });
          return leaveStack(remaining, modal);
        }, prevModals),
      );
    }, []);

    useImperativeHandle(magicModalRef, () => ({
      show,
      hide,
      hideAll,
      disableFullWindowOverlay,
      enableFullWindowOverlay,
    }));

    const modalList = useMemo(() => {
      // A dismissed entry that is still animating out is no longer part of the
      // stack, so the one underneath becomes topmost right away rather than
      // waiting for the animation.
      const topmostID = getLiveModals(modals).at(-1)?.id;

      return modals.map(
        ({ id, component, config, hideFunction, isExiting }) => {
          return (
            <MagicModalProvider key={id} hide={hideFunction}>
              <StackEntry
                config={config}
                isExiting={Boolean(isExiting)}
                isTopmost={id === topmostID}
                onExitFinished={() => {
                  removeModal(id);
                }}
              >
                {component}
              </StackEntry>
            </MagicModalProvider>
          );
        },
      );
    }, [modals, removeModal]);

    const Overlay =
      fullWindowOverlayEnabled && Platform.OS === "ios"
        ? FullWindowOverlay
        : React.Fragment;

    // Entries on their way out do not keep the portal in the accessibility
    // tree: as far as a screen reader is concerned they are already gone.
    const hasLiveModals = getLiveModals(modals).length > 0;

    /* This needs to always be rendered, if we make it conditionally render based on ModalContent too,
     the modal will have zIndex issues on react-navigation modals. */
    return (
      <Overlay>
        <View
          accessibilityElementsHidden={!hasLiveModals}
          accessibilityViewIsModal={hasLiveModals}
          aria-hidden={!hasLiveModals}
          importantForAccessibility={
            hasLiveModals ? "auto" : "no-hide-descendants"
          }
          style={[StyleSheet.absoluteFill, styles.wrapper]}
          testID="magic-modal-portal"
        >
          {modalList}
        </View>
      </Overlay>
    );
  });

const styles = StyleSheet.create({
  wrapper: {
    pointerEvents: "box-none",
  },
});
