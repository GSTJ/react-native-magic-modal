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

import type { ComponentType, ElementType, ReactNode } from "react";

import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import {
  ANIMATION_DURATION_IN_MS,
  OVERLAY_UNMOUNT_GRACE_IN_MS,
} from "../../constants/animations";
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

/**
 * The portal's outermost box: full-bleed, transparent to presses, and in or out
 * of the accessibility tree depending on whether anything is open.
 *
 * Injected because it is a `View` on React Native and a `div` on the web, and
 * because the browser one also carries the chrome's stylesheet.
 */
export type PortalContainerProps = {
  children: ReactNode;
  hasLiveModals: boolean;
};

/**
 * Subscribes to the platform's system back action, returning an unsubscribe.
 *
 * Android's hardware back on React Native; nothing at all in a browser, where
 * the equivalent gesture is Escape and the chrome's focus trap already owns it.
 * The handler returns true when it consumed the press.
 */
export type SystemBackSubscription = (
  onSystemBack: () => boolean,
) => () => void;

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
 * import { MagicModalPortal } from 'magic-modal';
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
export const createMagicModalPortal = <
  TConfig extends ModalProps = ModalProps,
>({
  FullWindowOverlay,
  isFullWindowOverlaySupported,
  PortalContainer,
  StackEntry,
  leaveStack = dropImmediately,
  subscribeToSystemBack,
}: {
  FullWindowOverlay: ElementType;
  /**
   * Whether the platform has a full-window overlay at all. True only on iOS,
   * and injected so this file needs no `Platform` to work that out.
   */
  isFullWindowOverlaySupported: boolean;
  PortalContainer: ComponentType<PortalContainerProps>;
  /**
   * The platform's modal chrome. Injected rather than imported so the browser
   * bundle never reaches the Reanimated and gesture-handler one, and so this
   * file — which both platforms share — needs no react-native of its own.
   */
  StackEntry: ComponentType<ModalStackEntryProps<TConfig>>;
  leaveStack?: ModalStackLeave;
  subscribeToSystemBack: SystemBackSubscription;
}): React.FC =>
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
              "[DEPRECATED] magic-modal deprecated 'hide' usage:\nCalling magicModal.hide without a modal ID is deprecated and will be removed in future versions.\nPlease provide a modal id to hide or use the preferred `useMagicModal` hook inside the modal to hide itself.\nDefaulting to hiding the last modal in the stack.",
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
     *
     * The count is of live entries, matching `hasLiveModals` below: an entry
     * the browser chrome parks as `isExiting` is already off the stack for
     * every other purpose. It reads the same on the overlay's own path, which
     * is iOS-only and where the native chrome drops entries on the spot, and it
     * keeps the wait timed off the config on either chrome.
     */
    useEffect(() => {
      const liveModals = getLiveModals(modals);

      if (liveModals.length > 0) {
        exitTimingRef.current = Math.max(
          ...liveModals.map((modal) => modal.config.animationOutTiming),
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
      return subscribeToSystemBack(() => {
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
      });
      // `subscribeToSystemBack` closes over `createMagicModalPortal`'s
      // argument, which is fixed for the lifetime of the component this
      // returns. It is not a render value, so it is not a dependency.
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
                // The stack is platform-agnostic and stores the neutral
                // `ModalProps`. Which platform's style-typed options are in
                // there was decided by the entry point that supplied the
                // chrome, and the chrome is the only thing that reads them.
                config={config as TConfig}
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
      fullWindowOverlayEnabled &&
      isOverlayMounted &&
      isFullWindowOverlaySupported
        ? FullWindowOverlay
        : React.Fragment;

    // Entries on their way out do not keep the portal in the accessibility
    // tree: as far as a screen reader is concerned they are already gone.
    const hasLiveModals = getLiveModals(modals).length > 0;

    /* The View below stays rendered whether or not there are modals: making it
     conditional on ModalContent gives the modal zIndex issues on
     react-navigation modals. Only the overlay wrapper comes and goes. */
    return (
      <Overlay>
        <PortalContainer hasLiveModals={hasLiveModals}>
          {modalList}
        </PortalContainer>
      </Overlay>
    );
  });
