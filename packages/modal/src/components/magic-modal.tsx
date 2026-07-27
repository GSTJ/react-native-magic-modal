import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { Direction, ModalChildren, ModalProps } from "../constants/types";
import type { SwipeGestureSpec } from "./panGesture";
import { defaultDirection } from "../constants/default-config";
import { MagicModalHideReason } from "../constants/types";
import { styles } from "./MagicModalPortal/magic-modal-portal.styles";
import { useInternalMagicModal } from "./magic-modal-provider";
import { PanGestureSurface } from "./panGesture";

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TOUCH_SLOP = 10;

export const defaultAnimationInMap = {
  up: FadeInUp,
  down: FadeInDown,
  left: FadeInLeft,
  right: FadeInRight,
} satisfies Record<Direction, unknown>;

export const defaultAnimationOutMap = {
  up: FadeOutUp,
  down: FadeOutDown,
  left: FadeOutLeft,
  right: FadeOutRight,
} satisfies Record<Direction, unknown>;

export const MagicModal = memo(
  ({
    config,
    children: Children,
  }: {
    config: ModalProps;
    children: ModalChildren;
  }) => {
    const { hide } = useInternalMagicModal();

    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const prevTranslationX = useSharedValue(0);
    const prevTranslationY = useSharedValue(0);

    /**
     * Necessary to skip exit animation when swipe is complete.
     * This is a problem on web, where the exit animation does not
     * work properly with the swipe animation styles.
     *
     * This seems to be a bug in reanimated.
     */
    const [isSwipeComplete, _setIsSwipeComplete] = React.useState(false);

    const { width, height } = useWindowDimensions();

    const onBackdropPress = useMemo(() => {
      return config.onBackdropPress
        ? () => config.onBackdropPress?.({ hide })
        : () => {
            hide({ reason: MagicModalHideReason.BACKDROP_PRESS });
          };
    }, [config, hide]);

    const isHorizontal =
      config.swipeDirection === "left" || config.swipeDirection === "right";

    const rangeMap = useMemo(
      () =>
        ({
          up: -height,
          down: height,
          left: -width,
          right: width,
        }) satisfies Record<Direction, number>,
      [height, width],
    );

    /**
     * Both swipe surfaces re-push the whole gesture to the native side when
     * this object's identity changes, so it lives in a `useMemo` keyed on
     * everything the worklets close over.
     *
     * The callback names are gesture-handler 2.x's, and `PanGestureSurface`
     * maps them to whichever API the installed major exposes. See
     * `panGesture/pan-gesture-surface.types.ts` for the mapping and for why
     * nothing hangs off `onFinalize`.
     */
    const swipe = useMemo<SwipeGestureSpec>(
      () => ({
        enabled: !!config.swipeDirection,
        // Matches the platform touch slop. Anything smaller (we used to use 1)
        // lets finger jitter during a tap activate the pan, which cancels the
        // touch on whatever the user was actually pressing inside the modal.
        minDistance: TOUCH_SLOP,
        onStart: () => {
          "worklet";

          prevTranslationX.value = translationX.value;
          prevTranslationY.value = translationY.value;
        },
        onUpdate: (event) => {
          "worklet";

          const translationValue = isHorizontal
            ? event.translationX
            : event.translationY;

          const prevTranslationValue = isHorizontal
            ? prevTranslationX.value
            : prevTranslationY.value;

          const shouldDampMap = {
            up: translationValue > 0,
            down: translationValue < 0,
            left: translationValue > 0,
            right: translationValue < 0,
          } satisfies Record<Direction, boolean>;

          const shouldDamp =
            shouldDampMap[config.swipeDirection ?? defaultDirection];

          const dampedTranslation = shouldDamp
            ? prevTranslationValue + translationValue * config.dampingFactor
            : prevTranslationValue + translationValue;

          if (isHorizontal) {
            translationX.value = dampedTranslation;
          } else {
            translationY.value = dampedTranslation;
          }
        },
        onEnd: (event) => {
          "worklet";

          const velocityThreshold = config.swipeVelocityThreshold;

          const shouldHideMap = {
            up: event.velocityY < -velocityThreshold,
            down: event.velocityY > velocityThreshold,
            right: event.velocityX > velocityThreshold,
            left: event.velocityX < -velocityThreshold,
          } satisfies Record<Direction, boolean>;

          const shouldHide =
            shouldHideMap[config.swipeDirection ?? defaultDirection];

          if (!shouldHide) {
            translationX.value = withSpring(0, {
              velocity: event.velocityX,
              damping: 75,
            });
            translationY.value = withSpring(0, {
              velocity: event.velocityY,
              damping: 75,
            });
            return;
          }

          const mainTranslation = isHorizontal ? translationX : translationY;

          mainTranslation.value = withSpring(
            rangeMap[config.swipeDirection ?? defaultDirection],
            { velocity: event.velocityX, overshootClamping: true },
            (success) => {
              "worklet";
              if (!success) return;

              // TODO: Re-enable after figuring out the Platform.OS
              // usage inside a worklet.
              // if (Platform.OS !== "web") {
              scheduleOnRN(hide, {
                reason: MagicModalHideReason.SWIPE_COMPLETE,
              });
              //   return;
              // }

              // runOnJS(setIsSwipeComplete)(true);

              // // Set immediate is needed so the hide function is called
              // // after "isSwipeComplete" is set to true.
              // runOnJS(setImmediate)(() =>
              //   hide({ reason: MagicModalHideReason.SWIPE_COMPLETE }),
              // );
            },
          );
        },
      }),
      [
        config.dampingFactor,
        config.swipeDirection,
        config.swipeVelocityThreshold,
        hide,
        isHorizontal,
        prevTranslationX,
        prevTranslationY,
        rangeMap,
        translationX,
        translationY,
      ],
    );

    const animatedStyles = useAnimatedStyle(() => {
      "worklet";
      return {
        transform: [
          { translateX: translationX.value },
          { translateY: translationY.value },
        ],
      };
    });

    const animatedBackdropStyles = useAnimatedStyle(() => {
      "worklet";
      const translationValue = isHorizontal
        ? translationX.value
        : translationY.value;

      return {
        opacity: interpolate(
          translationValue,
          [rangeMap[config.swipeDirection ?? defaultDirection], 0],
          [0, 1],
          Extrapolation.CLAMP,
        ),
      };
    });

    const isBackdropVisible = !config.hideBackdrop;

    return (
      <View style={[StyleSheet.absoluteFill, styles.pointerEventsBoxNone]}>
        <Animated.View
          pointerEvents={isBackdropVisible ? "auto" : "none"}
          entering={FadeIn.duration(config.animationInTiming)}
          exiting={FadeOut.duration(config.animationOutTiming)}
          style={styles.backdropContainer}
        >
          <AnimatedPressable
            testID="magic-modal-backdrop"
            style={[
              styles.backdrop,
              animatedBackdropStyles,
              // eslint-disable-next-line react-native/no-inline-styles, react-native/no-color-literals
              {
                backgroundColor: isBackdropVisible
                  ? config.backdropColor
                  : "transparent",
              },
            ]}
            onPress={onBackdropPress}
          />
        </Animated.View>
        <Animated.View
          style={[styles.overlay, styles.pointerEventsBoxNone, animatedStyles]}
        >
          <Animated.View
            style={[styles.overlay, styles.pointerEventsBoxNone, config.style]}
            entering={
              !isSwipeComplete
                ? (config.entering ??
                  defaultAnimationInMap[
                    config.swipeDirection ?? defaultDirection
                  ].duration(config.animationInTiming))
                : undefined
            }
            exiting={
              !isSwipeComplete
                ? (config.exiting ??
                  defaultAnimationOutMap[
                    config.swipeDirection ?? defaultDirection
                  ].duration(config.animationOutTiming))
                : undefined
            }
          >
            <PanGestureSurface swipe={swipe}>
              <View
                collapsable={false}
                style={[
                  styles.childrenWrapper,
                  styles.pointerEventsBoxNone,
                  config.style,
                ]}
              >
                <Children />
              </View>
            </PanGestureSurface>
          </Animated.View>
        </Animated.View>
      </View>
    );
  },
);
