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
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { ANIMATION_DURATION_IN_MS } from "./constants/animations";
import type { IModal, ModalChildren } from "./utils/magicModalHandler";
import { magicModalRef } from "./utils/magicModalHandler";
import { styles } from "./MagicModalPortal.styles";
import { FullWindowOverlay } from "./FullWindowOverlay";
import {
  BackHandler,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

export type Direction = "top" | "bottom" | "left" | "right";

export type ModalProps = {
  /**
   * Duration of the animation when the modal is shown.
   * @default 300
   */
  animationInTiming: number;

  /**
   * Duration of the animation when the modal is hidden.
   * @default 300
   */
  animationOutTiming: number;

  /**
   * If true, the backdrop will be hidden.
   * @default false
   */
  hideBackdrop: boolean;

  /**
   * The color of the backdrop.
   * @default "rgba(0, 0, 0, 0.5)"
   */
  backdropColor: string;

  /**
   * Function to be called when the back button is pressed.
   * @default undefined
   * @example () => { console.log('Back button pressed'); magicModal.hide(); }
   */
  onBackButtonPress: (() => void) | undefined;

  /**
   * Function to be called when the backdrop is pressed.
   * @default undefined
   * @example () => { console.log('Backdrop pressed'); magicModal.hide(); }
   */
  onBackdropPress: (() => void) | undefined;

  /**
   * Custom style for the modal.
   * @default {}
   * @example { backgroundColor: 'red', padding: 10 }
   */
  style: Record<string, unknown>;

  /**
   * Damping factor for the swipe gesture.
   * @default 0.2
   */
  dampingFactor: number;

  /**
   * Direction of the modal animation.
   * @default "bottom"
   * @example "top"
   */
  direction: Direction;

  /**
   * Velocity threshold for the swipe gesture.
   * @default 500
   */
  swipeVelocityThreshold: number;
};

type GenericFunction = (props: any) => any;

export enum MagicModalHideTypes {
  BACKDROP_PRESSED = "BACKDROP_PRESSED",
  SWIPE_COMPLETED = "SWIPE_COMPLETED",
  BACK_BUTTON_PRESSED = "BACK_BUTTON_PRESSED",
  MODAL_OVERRIDE = "MODAL_OVERRIDE",
}

export const modalRefForTests = React.createRef<any>();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const defaultConfig = {
  animationInTiming: ANIMATION_DURATION_IN_MS,
  animationOutTiming: ANIMATION_DURATION_IN_MS,
  hideBackdrop: false,
  backdropColor: "rgba(0, 0, 0, 0.5)",
  dampingFactor: 0.2,
  direction: "bottom",
  swipeVelocityThreshold: 500,
  onBackButtonPress: undefined,
  onBackdropPress: undefined,
  style: {},
} satisfies ModalProps;

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
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<ModalProps>(defaultConfig);
  const [modalContent, setModalContent] = useState<React.ReactNode>(<></>);

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  const onHideRef = useRef<GenericFunction>(() => {});

  const { width, height } = useWindowDimensions();

  const getDirectionTranslation = (direction: Direction, value: number) => {
    switch (direction) {
      case "left":
        return { translationX: -value, translationY: 0 };
      case "right":
        return { translationX: value, translationY: 0 };
      case "top":
        return { translationX: 0, translationY: -value };
      case "bottom":
        return { translationX: 0, translationY: value };
    }
  };

  const hide = useCallback<IModal["hide"]>(
    async (props) => {
      const springConfig = {
        duration: config.animationOutTiming,
        dampingRatio: 3,
      };

      const directionTranslation = getDirectionTranslation(
        config.direction,
        height
      );

      await new Promise<void>((resolve) => {
        if (directionTranslation.translationX !== 0) {
          translationX.value = withSpring(
            directionTranslation.translationX,
            springConfig,
            () => runOnJS(resolve)()
          );
          return;
        }

        translationY.value = withSpring(
          directionTranslation.translationY,
          springConfig,
          () => runOnJS(resolve)()
        );
      });

      setIsVisible(false);

      onHideRef.current(props);
    },
    [
      config.animationOutTiming,
      config.direction,
      height,
      translationX,
      translationY,
    ]
  );

  useImperativeHandle(magicModalRef, () => ({
    hide,
    show: async (
      newComponent: ModalChildren,
      newConfig: Partial<ModalProps> = {}
    ) => {
      if (isVisible) await hide(MagicModalHideTypes.MODAL_OVERRIDE);

      const springConfig = {
        duration: config.animationInTiming,
        dampingRatio: 1,
      };

      const startPosition = {
        bottom: {
          translationX: 0,
          translationY: height,
        },
        top: {
          translationX: 0,
          translationY: -height,
        },
        left: {
          translationX: -width,
          translationY: 0,
        },
        right: {
          translationX: width,
          translationY: 0,
        },
      };

      const mergedConfig = {
        ...defaultConfig,
        ...newConfig,
      };

      translationX.value = startPosition[mergedConfig.direction].translationX;
      translationY.value = startPosition[mergedConfig.direction].translationY;

      translationX.value = withSpring(0, springConfig);
      translationY.value = withSpring(0, springConfig);

      prevTranslationX.value = 0;
      prevTranslationY.value = 0;

      setModalContent(newComponent as unknown as React.ReactNode);
      setConfig(mergedConfig);
      setIsVisible(true);

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

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      const direction = config.direction;
      const translationValue =
        direction.includes("left") || direction.includes("right")
          ? event.translationX
          : event.translationY;

      const prevTranslationValue =
        direction.includes("left") || direction.includes("right")
          ? prevTranslationX.value
          : prevTranslationY.value;

      const shouldDamp =
        (direction === "bottom" && translationValue < 0) ||
        (direction === "top" && translationValue > 0) ||
        (direction === "left" && translationValue > 0) ||
        (direction === "right" && translationValue < 0);

      const dampedTranslation = shouldDamp
        ? prevTranslationValue + translationValue * config.dampingFactor
        : prevTranslationValue + translationValue;

      const maxTranslate =
        direction.includes("left") || direction.includes("right")
          ? width / 2 - 50
          : height / 2 - 50;

      const limitedTranslation =
        Math.abs(dampedTranslation) > Math.abs(maxTranslate)
          ? maxTranslate * Math.sign(dampedTranslation)
          : dampedTranslation;

      if (direction.includes("left") || direction.includes("right")) {
        translationX.value = limitedTranslation;
      } else {
        translationY.value = limitedTranslation;
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
        hide(MagicModalHideTypes.SWIPE_COMPLETED);
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
    })
    .runOnJS(true);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const animatedBackdropStyles = useAnimatedStyle(() => {
    const translationValue =
      config.direction.includes("left") || config.direction.includes("right")
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
    if (!isVisible) return;

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
  }, [config.onBackButtonPress, hide, isVisible]);

  return (
    <FullWindowOverlay>
      {isVisible && (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <AnimatedPressable
            pointerEvents={config.hideBackdrop ? "none" : "auto"}
            style={[
              styles.backdrop,
              animatedBackdropStyles,
              {
                backgroundColor: config.hideBackdrop
                  ? "transparent"
                  : config.backdropColor ?? styles.backdrop.backgroundColor,
              },
            ]}
            onPress={onBackdropPress}
          />
          <Animated.View
            pointerEvents="box-none"
            style={[
              animatedStyles,
              styles.overlay,
              styles.container,
              config.style,
            ]}
          >
            <GestureDetector gesture={pan}>{modalContent}</GestureDetector>
          </Animated.View>
        </View>
      )}
    </FullWindowOverlay>
  );
};
