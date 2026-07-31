import type { ModalStackEntryProps } from "../constants/types";
import type { ModalProps } from "../constants/types.browser";

import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { defaultDirection } from "../constants/default-config";
import { MagicModalHideReason } from "../constants/types";
import { useInternalMagicModal } from "./magic-modal-provider";
import {
  getDialogAriaProps,
  getStackEntryAriaHidden,
  MODAL_DIALOG_TEST_ID,
  useWebModalFocus,
} from "./webModal/modal-accessibility";
import { resolveModalStyle } from "./webModal/modal-style-prop";
import { classes, MODAL_CLASS } from "./webModal/modal-styles";
import {
  getContentEnterKeyframes,
  getContentExitKeyframes,
  getFadeKeyframes,
  runWebAnimation,
} from "./webModal/modal-transitions";
import { useSwipeDismiss } from "./webModal/use-swipe-dismiss";
import { useViewportSize } from "./webModal/use-viewport-size";

/**
 * The browser modal chrome.
 *
 * The same layers, the same test IDs and the same accessibility contract as the
 * React Native chrome in `magic-modal.tsx`, built out of `div`s, static CSS,
 * the Web Animations API and Pointer Events.
 *
 * Nothing this file reaches imports react-native. That is the point of it:
 * react-native-web and its style pipeline were 84% of what a web app
 * downloaded for this library, to render five nested boxes and centre one of
 * them. `tools/check-web-build.mjs` fails the build if an import creeps back.
 *
 * Nothing here touches `document` or `window` at module scope either, so a
 * Next.js server component can import the package.
 *
 * Unlike the native chrome, this one plays an exit animation. It leans on the
 * portal keeping a dismissed entry in the stack until `onExitFinished` fires.
 */

/** `useLayoutEffect` warns when React renders on a server, where it never runs. */
const useIsomorphicLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

export const MagicModal = memo(
  ({
    config,
    children: Children,
    isExiting,
    isTopmost,
    onExitFinished,
  }: ModalStackEntryProps<ModalProps>) => {
    const { hide } = useInternalMagicModal();
    const [dialogNode, setDialogNode] = React.useState<HTMLDivElement | null>(
      null,
    );
    const { onBackButtonPress } = config;
    const { height, width } = useViewportSize();

    const backdropLayerRef = useRef<HTMLDivElement | null>(null);
    const backdropRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const motionRef = useRef<HTMLDivElement | null>(null);

    /** Set once a committed swipe has taken the content off screen. */
    const hasSwipedAwayRef = useRef(false);

    const direction = config.swipeDirection ?? defaultDirection;
    const style = resolveModalStyle(config.style);

    const onBackdropPress = useMemo(() => {
      return config.onBackdropPress
        ? () => config.onBackdropPress?.({ hide })
        : () => {
            hide({ reason: MagicModalHideReason.BACKDROP_PRESS });
          };
    }, [config, hide]);

    const onSystemDismiss = useCallback(() => {
      if (onBackButtonPress) {
        onBackButtonPress({ hide });
        return;
      }

      hide({ reason: MagicModalHideReason.BACK_BUTTON_PRESS });
    }, [hide, onBackButtonPress]);

    useWebModalFocus({
      childrenIdentity: Children,
      dialogNode,
      isTopmost,
      onSystemDismiss,
    });

    const onSwipeDismissed = useCallback(() => {
      hasSwipedAwayRef.current = true;
      hide({ reason: MagicModalHideReason.SWIPE_COMPLETE });
    }, [hide]);

    useSwipeDismiss({
      backdropRef,
      dampingFactor: config.dampingFactor,
      dialogNode,
      direction: config.swipeDirection,
      dismissDuration: config.animationOutTiming,
      height,
      motionRef,
      onDismissed: onSwipeDismissed,
      velocityThreshold: config.swipeVelocityThreshold,
      width,
    });

    const entrance = useRef({
      direction,
      duration: config.animationInTiming,
    });

    // Mount only: the entrance reads its direction and duration once, the way
    // Reanimated snapshots an `entering` builder when the view appears.
    useIsomorphicLayoutEffect(() => {
      const running = [
        runWebAnimation(backdropLayerRef.current, getFadeKeyframes(0, 1), {
          duration: entrance.current.duration,
        }),
        runWebAnimation(
          contentRef.current,
          getContentEnterKeyframes(entrance.current.direction),
          { duration: entrance.current.duration },
        ),
      ];

      return () => {
        for (const animation of running) {
          animation.cancel();
        }
      };
    }, []);

    const exitDuration = config.animationOutTiming;

    // The portal holds a dismissed entry in the stack until this fires, which
    // is the only reason there is an exit to watch at all.
    const exit = useRef({ direction, onExitFinished });
    useEffect(() => {
      exit.current = { direction, onExitFinished };
    });

    useEffect(() => {
      if (!isExiting) {
        return;
      }

      // A committed swipe already faded the backdrop and flew the content off
      // screen. There is nothing left to play, and replaying the 25px slide
      // from where it landed would drag it back into view first.
      if (hasSwipedAwayRef.current) {
        exit.current.onExitFinished();
        return;
      }

      const running = [
        runWebAnimation(backdropLayerRef.current, getFadeKeyframes(1, 0), {
          duration: exitDuration,
        }),
        runWebAnimation(
          contentRef.current,
          getContentExitKeyframes(exit.current.direction),
          { duration: exitDuration },
        ),
      ];

      let isCancelled = false;

      void Promise.all(running.map(({ finished }) => finished)).then(() => {
        if (!isCancelled) {
          exit.current.onExitFinished();
        }
      });

      return () => {
        isCancelled = true;
      };
    }, [exitDuration, isExiting]);

    const isBackdropVisible = !config.hideBackdrop;
    const isBackdropPressable = isBackdropVisible && !isExiting;
    const dialogAriaProps = getDialogAriaProps({
      accessibilityLabel: config.accessibilityLabel,
      isTopmost,
    });

    return (
      <div
        aria-hidden={getStackEntryAriaHidden(isTopmost)}
        className={classes(
          MODAL_CLASS.entry,
          isTopmost ? MODAL_CLASS.boxNone : MODAL_CLASS.none,
        )}
        data-testid="magic-modal-stack-entry"
      >
        <div
          className={classes(
            MODAL_CLASS.backdropLayer,
            !isBackdropPressable && MODAL_CLASS.none,
          )}
          ref={backdropLayerRef}
        >
          <div
            aria-hidden
            className={MODAL_CLASS.backdrop}
            data-testid="magic-modal-backdrop"
            ref={backdropRef}
            role="presentation"
            // The backdrop colour is configuration, so it cannot live in the
            // static stylesheet. The two rules below are react-native's, and
            // this is a `div`.
            // eslint-disable-next-line react-native/no-inline-styles, react-native/no-color-literals
            style={{
              backgroundColor: isBackdropVisible
                ? config.backdropColor
                : "transparent",
            }}
            // A `div` rather than a `button`: the backdrop is `aria-hidden`,
            // and a focusable element inside an `aria-hidden` subtree is a trap
            // for keyboard and screen reader users. Escape is the keyboard's
            // way out, and it is handled by the focus trap.
            onClick={isBackdropPressable ? onBackdropPress : undefined}
          />
        </div>
        <div
          className={classes(MODAL_CLASS.layer, MODAL_CLASS.boxNone)}
          data-testid="magic-modal-motion-layer"
          ref={motionRef}
        >
          <div
            className={classes(MODAL_CLASS.layer, MODAL_CLASS.boxNone)}
            data-testid="magic-modal-animation-layer"
            ref={contentRef}
            style={style}
          >
            <div
              {...dialogAriaProps}
              className={classes(MODAL_CLASS.layer, MODAL_CLASS.boxNone)}
              data-testid={MODAL_DIALOG_TEST_ID}
              ref={setDialogNode}
              style={style}
            >
              <Children />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
