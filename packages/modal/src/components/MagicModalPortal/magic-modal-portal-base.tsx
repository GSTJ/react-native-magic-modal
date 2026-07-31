import type {
  GlobalHideFunction,
  GlobalShowFunction,
  GlobalUpdateFunction,
  HideReturn,
  ModalChildren,
  ModalHandle,
  ModalProps,
  ModalUpdateFunction,
  NewConfigProps,
} from "../../constants/types";

import type { ElementType } from "react";

import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";

import {
  ANIMATION_DURATION_IN_MS,
  OVERLAY_UNMOUNT_GRACE_IN_MS,
} from "../../constants/animations";
import { defaultConfig } from "../../constants/default-config";
import { MagicModalHideReason } from "../../constants/types";
import { magicModalRef } from "../../utils/magic-modal-handler";
import { MagicModal } from "../magic-modal";
import { MagicModalProvider } from "../magic-modal-provider";

const generatePseudoRandomID = () =>
  Math.random().toString(36).slice(7).toUpperCase() + Date.now().toString();

type ModalStackItem = {
  id: string;
  component: ModalChildren;
  config: ModalProps;
  hideCallback: (value: unknown) => void;
  hideFunction: (props: unknown) => void;
};

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
export const createMagicModalPortal = (
  FullWindowOverlay: ElementType,
): React.FC =>
  memo(() => {
    const [modals, setModals] = React.useState<ModalStackItem[]>([]);
    const [fullWindowOverlayEnabled, setFullWindowOverlayEnabled] =
      React.useState(true);
    // Mounting the overlay permanently creates a native UIWindow that owns the
    // accessibility tree even with an empty stack, so it is mounted on demand.
    const [isOverlayMounted, setIsOverlayMounted] = React.useState(false);
    // The exit timing of whatever is currently on the stack, kept so the
    // unmount delay is still readable once the stack is empty.
    const exitTimingRef = useRef(ANIMATION_DURATION_IN_MS);

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

        const safeModal = currentModal ?? prevModals.at(-1);

        safeModal?.hideCallback(props);

        return prevModals.filter((modal) => modal.id !== safeModal?.id);
      });
    }, []);

    const update = useCallback<GlobalUpdateFunction>(
      (newComponent, { modalID }) => {
        setModals((prevModals) => {
          const currentModal = prevModals.find((modal) => modal.id === modalID);

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

        // Batched with the stack update, so the overlay and the modal land in
        // the same commit and the entering animation runs once, inside it.
        setIsOverlayMounted(true);
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

    /**
     * Keeps the overlay alive through the closing animation.
     *
     * A hidden entry leaves state immediately, but its Reanimated `exiting`
     * animation is still playing. Unmounting the overlay right then tears down
     * the native window mid-animation: the closing modal blinks, drops out of
     * the top layer, and loses focus. So the unmount waits out the exit timing
     * of whatever was on the stack.
     *
     * Anything that repopulates the stack, a `show` during the wait included,
     * changes `modals` and cancels the pending unmount through the cleanup, so
     * back-to-back modals never blink.
     */
    useEffect(() => {
      if (modals.length > 0) {
        exitTimingRef.current = Math.max(
          ...modals.map((modal) => modal.config.animationOutTiming),
        );
        return;
      }

      if (!isOverlayMounted) {
        return;
      }

      const timeout = setTimeout(() => {
        setIsOverlayMounted(false);
      }, exitTimingRef.current + OVERLAY_UNMOUNT_GRACE_IN_MS);

      return () => {
        clearTimeout(timeout);
      };
    }, [isOverlayMounted, modals]);

    useEffect(() => {
      if (Platform.OS === "web") {
        return;
      }

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          const lastModal = modals.at(-1);

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
        for (const modal of prevModals) {
          modal.hideCallback({ reason: MagicModalHideReason.GLOBAL_HIDE_ALL });
        }
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
      return modals.map(({ id, component, config, hideFunction }, index) => {
        return (
          <MagicModalProvider key={id} hide={hideFunction}>
            <MagicModal config={config} isTopmost={index === modals.length - 1}>
              {component}
            </MagicModal>
          </MagicModalProvider>
        );
      });
    }, [modals]);

    const Overlay =
      fullWindowOverlayEnabled && isOverlayMounted && Platform.OS === "ios"
        ? FullWindowOverlay
        : React.Fragment;

    /* The View below stays rendered whether or not there are modals: making it
     conditional on ModalContent gives the modal zIndex issues on
     react-navigation modals. Only the overlay wrapper comes and goes. */
    return (
      <Overlay>
        <View
          accessibilityElementsHidden={modals.length === 0}
          accessibilityViewIsModal={modals.length > 0}
          aria-hidden={modals.length === 0}
          importantForAccessibility={
            modals.length > 0 ? "auto" : "no-hide-descendants"
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
