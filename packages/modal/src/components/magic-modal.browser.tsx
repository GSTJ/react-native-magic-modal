import type { ModalStackEntryProps } from "../constants/types";

import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { defaultDirection } from "../constants/default-config";
import { MagicModalHideReason } from "../constants/types";
import { useInternalMagicModal } from "./magic-modal-provider";
import { styles } from "./MagicModalPortal/magic-modal-portal.styles";
import {
  getDialogAccessibilityProps,
  getStackEntryAccessibilityProps,
  MODAL_DIALOG_TEST_ID,
  useWebModalFocus,
} from "./webModal/modal-accessibility";
import {
  getContentEnterKeyframes,
  getContentExitKeyframes,
  getFadeKeyframes,
  runWebAnimation,
} from "./webModal/modal-transitions";
import { useSwipeDismiss } from "./webModal/use-swipe-dismiss";

/**
 * The browser modal chrome.
 *
 * The same tree, test IDs and accessibility semantics as the React Native
 * chrome in `magic-modal.tsx`, driven by the Web Animations API and Pointer
 * Events instead of Reanimated and gesture-handler. Nothing this file reaches
 * imports react-native-reanimated, react-native-gesture-handler,
 * react-native-worklets or react-native-screens, and
 * `tools/check-web-build.mjs` fails the build if that stops being true.
 *
 * Unlike the native chrome, this one plays an exit animation. It leans on the
 * portal keeping a dismissed entry in the stack until `onExitFinished` fires.
 */

/** `useLayoutEffect` warns when React renders on a server, where it never runs. */
const useIsomorphicLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

/**
 * react-native-web hands host refs the DOM node itself but types them as the
 * React Native component. This is the one place that conversion happens.
 */
const asElement = (node: unknown) => (node ?? null) as HTMLElement | null;

const useElementRef = () => {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((node: unknown) => {
    ref.current = asElement(node);
  }, []);

  return [ref, setRef] as const;
};

export const MagicModal = memo(
  ({
    config,
    children: Children,
    isExiting,
    isTopmost,
    onExitFinished,
  }: ModalStackEntryProps) => {
    const { hide } = useInternalMagicModal();
    const [dialogNode, setDialogNode] = React.useState<View | null>(null);
    const { onBackButtonPress } = config;
    const { height, width } = useWindowDimensions();

    const [backdropLayerRef, setBackdropLayerRef] = useElementRef();
    const [backdropRef, setBackdropRef] = useElementRef();
    const [contentRef, setContentRef] = useElementRef();
    const [motionRef, setMotionRef] = useElementRef();

    /** Set once a committed swipe has taken the content off screen. */
    const hasSwipedAwayRef = useRef(false);

    const direction = config.swipeDirection ?? defaultDirection;

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
      dialogNode: asElement(dialogNode),
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
    }, [backdropLayerRef, contentRef]);

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
    }, [backdropLayerRef, contentRef, exitDuration, isExiting]);

    const isBackdropVisible = !config.hideBackdrop;
    const stackEntryAccessibilityProps =
      getStackEntryAccessibilityProps(isTopmost);
    const dialogAccessibilityProps = getDialogAccessibilityProps({
      accessibilityLabel: config.accessibilityLabel,
      isTopmost,
      onSystemDismiss,
    });

    return (
      <View
        {...stackEntryAccessibilityProps}
        style={[StyleSheet.absoluteFill, styles.pointerEventsBoxNone]}
        testID="magic-modal-stack-entry"
      >
        <View
          pointerEvents={isBackdropVisible && !isExiting ? "auto" : "none"}
          ref={setBackdropLayerRef}
          style={styles.backdropContainer}
        >
          <Pressable
            accessibilityElementsHidden
            accessible={false}
            aria-hidden
            disabled={!isBackdropVisible}
            importantForAccessibility="no-hide-descendants"
            ref={setBackdropRef}
            testID="magic-modal-backdrop"
            style={[
              styles.backdrop,
              // eslint-disable-next-line react-native/no-inline-styles, react-native/no-color-literals
              {
                backgroundColor: isBackdropVisible
                  ? config.backdropColor
                  : "transparent",
              },
            ]}
            onPress={onBackdropPress}
          />
        </View>
        <View
          pointerEvents="box-none"
          ref={setMotionRef}
          style={styles.overlay}
          testID="magic-modal-motion-layer"
        >
          <View
            pointerEvents="box-none"
            ref={setContentRef}
            style={[styles.overlay, config.style]}
            testID="magic-modal-animation-layer"
          >
            <View
              {...dialogAccessibilityProps}
              collapsable={false}
              ref={setDialogNode}
              style={[
                styles.childrenWrapper,
                config.style,
                styles.pointerEventsBoxNone,
              ]}
              testID={MODAL_DIALOG_TEST_ID}
            >
              <Children />
            </View>
          </View>
        </View>
      </View>
    );
  },
);
