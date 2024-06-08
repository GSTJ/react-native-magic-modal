import React, { memo, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { defaultDirection } from "../constants/defaultConfig";
import {
  Direction,
  MagicModalHideTypes,
  ModalChildren,
  ModalProps,
} from "../constants/types";
import { styles } from "./MagicModalPortal/MagicModalPortal.styles";
import { useMagicModal } from "./MagicModalProvider";

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    const { hide } = useMagicModal();

    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const prevTranslationX = useSharedValue(0);
    const prevTranslationY = useSharedValue(0);

    const { width, height } = useWindowDimensions();

    useEffect(() => {
      return () => {
        translationX.value = 0;
        translationY.value = 0;
      };
    }, []);

    const onBackdropPress = useMemo(() => {
      return (
        config.onBackdropPress ??
        (() => hide(MagicModalHideTypes.BACKDROP_PRESSED))
      );
    }, [config.onBackdropPress, hide]);

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

    const pan = Gesture.Pan()
      .enabled(!!config.swipeDirection)
      .minDistance(1)
      .onStart(() => {
        prevTranslationX.value = translationX.value;
        prevTranslationY.value = translationY.value;
      })
      .onUpdate((event) => {
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
      })
      .onEnd((event) => {
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
          (success) =>
            success && runOnJS(hide)(MagicModalHideTypes.SWIPE_COMPLETED),
        );

        return;
      });

    const animatedStyles = useAnimatedStyle(
      () => ({
        transform: [
          { translateX: translationX.value },
          { translateY: translationY.value },
        ],
      }),
      [translationX.value, translationY.value],
    );

    const animatedBackdropStyles = useAnimatedStyle(() => {
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
    }, [
      config.swipeDirection,
      translationX.value,
      translationY.value,
      rangeMap,
    ]);

    const isBackdropVisible = !config.hideBackdrop;

    return (
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
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
          pointerEvents="box-none"
          style={[styles.overlay, animatedStyles]}
        >
          <Animated.View
            pointerEvents="box-none"
            style={[styles.overlay, config.style]}
            entering={
              config.entering ??
              defaultAnimationInMap[
                config.swipeDirection ?? defaultDirection
              ].duration(config.animationInTiming)
            }
            exiting={
              config.exiting ??
              defaultAnimationOutMap[
                config.swipeDirection ?? defaultDirection
              ].duration(config.animationOutTiming)
            }
          >
            <GestureDetector gesture={pan}>
              <Children />
            </GestureDetector>
          </Animated.View>
        </Animated.View>
      </View>
    );
  },
);
