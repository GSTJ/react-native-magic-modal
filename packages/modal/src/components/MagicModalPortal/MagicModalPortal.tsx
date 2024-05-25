import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { IModal } from "../../utils/magicModalHandler";
import { magicModalRef } from "../../utils/magicModalHandler";
import { styles } from "./MagicModalPortal.styles";
import { FullWindowOverlay } from "../FullWindowOverlay/FullWindowOverlay";
import {
  BackHandler,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  ModalProps,
  GenericFunction,
  MagicModalHideTypes,
  ModalChildren,
} from "../../constants/types";
import { defaultConfig } from "../../constants/defaultConfig";

export const modalRefForTests = React.createRef<any>();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const defaultAnimationInMap = {
  bottom: FadeInDown,
  top: FadeInUp,
  left: FadeInLeft,
  right: FadeInRight,
};

const defaultAnimationOutMap = {
  bottom: FadeOutDown,
  top: FadeOutUp,
  left: FadeOutLeft,
  right: FadeOutRight,
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
export const MagicModalPortal: React.FC = () => {
  const [config, setConfig] = useState<ModalProps>(defaultConfig);
  const [modalContent, setModalContent] = useState<React.ReactNode>(undefined);

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  const onHideRef = useRef<GenericFunction>(() => {});

  const { width, height } = useWindowDimensions();

  const hide = useCallback<IModal["hide"]>(async (props) => {
    setModalContent(undefined);
    onHideRef.current(props);
  }, []);

  useImperativeHandle(magicModalRef, () => ({
    hide,
    show: async (
      newComponent: ModalChildren,
      newConfig: Partial<ModalProps> = {}
    ) => {
      if (modalContent) await hide(MagicModalHideTypes.MODAL_OVERRIDE);

      const mergedConfig = { ...defaultConfig, ...newConfig };

      translationX.value = 0;
      translationY.value = 0;

      setConfig(mergedConfig);
      setModalContent(newComponent as unknown as React.ReactNode);

      return new Promise((resolve) => {
        onHideRef.current = resolve;
      });
    },
  }));

  const onBackdropPress = useMemo(() => {
    return (
      config.onBackdropPress ??
      (() => hide(MagicModalHideTypes.BACKDROP_PRESSED))
    );
  }, [config.onBackdropPress, hide]);

  const isHorizontal =
    config.direction === "left" || config.direction === "right";

  const pan = Gesture.Pan()
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

      const shouldDamp =
        (config.direction === "bottom" && translationValue < 0) ||
        (config.direction === "top" && translationValue > 0) ||
        (config.direction === "left" && translationValue > 0) ||
        (config.direction === "right" && translationValue < 0);

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
      const shouldHide =
        (config.direction === "right" && event.velocityX > velocityThreshold) ||
        (config.direction === "left" && event.velocityX < -velocityThreshold) ||
        (config.direction === "top" && event.velocityY < -velocityThreshold) ||
        (config.direction === "bottom" && event.velocityY > velocityThreshold);

      if (shouldHide) {
        runOnJS(hide)(MagicModalHideTypes.SWIPE_COMPLETED);
        return;
      }

      translationX.value = withSpring(0, {
        velocity: event.velocityX,
        damping: 75,
      });
      translationY.value = withSpring(0, {
        velocity: event.velocityY,
        damping: 75,
      });
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const animatedBackdropStyles = useAnimatedStyle(() => {
    const translationValue = isHorizontal
      ? translationX.value
      : translationY.value;

    const rangeMap = {
      left: [-width, 0],
      right: [width, 0],
      top: [-height, 0],
      bottom: [height, 0],
    };

    return {
      opacity: interpolate(
        translationValue,
        rangeMap[config.direction],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  useEffect(() => {
    if (!modalContent) return;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (config.onBackButtonPress) {
          config.onBackButtonPress();
        } else {
          hide(MagicModalHideTypes.BACK_BUTTON_PRESSED);
        }
        return true;
      }
    );
    return () => backHandler.remove();
  }, [config.onBackButtonPress, hide, modalContent]);

  const isBackdropVisible = modalContent && !config.hideBackdrop;

  return (
    <FullWindowOverlay>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Animated.View
          pointerEvents={isBackdropVisible ? "auto" : "none"}
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.backdropContainer}
        >
          <AnimatedPressable
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
        {modalContent ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.overlay,
              styles.container,
              config.style,
              animatedStyles,
            ]}
          >
            <Animated.View
              entering={
                config.entering ??
                defaultAnimationInMap[config.direction].duration(
                  config.animationInTiming
                )
              }
              exiting={
                config.exiting ??
                defaultAnimationOutMap[config.direction].duration(
                  config.animationOutTiming
                )
              }
            >
              <GestureDetector gesture={pan}>{modalContent}</GestureDetector>
            </Animated.View>
          </Animated.View>
        ) : null}
      </View>
    </FullWindowOverlay>
  );
};
