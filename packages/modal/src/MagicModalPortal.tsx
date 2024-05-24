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
  withSequence,
  withSpring,
  withTiming,
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

const defaultConfig: ModalProps = {
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
  const [config, setConfig] = useState<ModalProps>(defaultConfig);
  const [modalContent, setModalContent] = useState<React.ReactNode>(undefined);

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  const onHideRef = useRef<GenericFunction>(() => {});

  const { width, height } = useWindowDimensions();

  const hide = useCallback<IModal["hide"]>(
    async (props) => {
      const springConfig = {
        duration: config.animationOutTiming,
        dampingRatio: 3,
      };

      const translationMap = {
        left: { translationX: -width, translationY: 0 },
        right: { translationX: width, translationY: 0 },
        top: { translationX: 0, translationY: -height },
        bottom: { translationX: 0, translationY: height },
      };

      const directionTranslation = translationMap[config.direction];

      await new Promise<void>((resolve) => {
        if (directionTranslation.translationX !== 0) {
          translationX.value = withSpring(
            directionTranslation.translationX,
            springConfig,
            () => runOnJS(resolve)(),
          );
          return;
        }
        translationY.value = withSpring(
          directionTranslation.translationY,
          springConfig,
          () => runOnJS(resolve)(),
        );
      });

      setModalContent(undefined);
      onHideRef.current(props);
    },
    [
      config.animationOutTiming,
      config.direction,
      height,
      translationX,
      translationY,
    ],
  );

  useImperativeHandle(magicModalRef, () => ({
    hide,
    show: async (
      newComponent: ModalChildren,
      newConfig: Partial<ModalProps> = {},
    ) => {
      if (modalContent) await hide(MagicModalHideTypes.MODAL_OVERRIDE);

      const springConfig = {
        duration: config.animationInTiming,
        dampingRatio: 1,
      };
      const startPosition = {
        bottom: { translationX: 0, translationY: height },
        top: { translationX: 0, translationY: -height },
        left: { translationX: -width, translationY: 0 },
        right: { translationX: width, translationY: 0 },
      };
      const mergedConfig = { ...defaultConfig, ...newConfig };

      setConfig(mergedConfig);

      Promise.allSettled([
        new Promise<void>((resolve) => {
          translationX.value = withSequence(
            withTiming(
              startPosition[mergedConfig.direction].translationX,
              { duration: 0 },
              () => runOnJS(resolve)(),
            ),
            withSpring(0, springConfig),
          );
        }),
        new Promise<void>((resolve) => {
          translationY.value = withSequence(
            withTiming(
              startPosition[mergedConfig.direction].translationY,
              { duration: 0 },
              () => runOnJS(resolve)(),
            ),
            withSpring(0, springConfig),
          );
        }),
      ]).finally(() => {
        setModalContent(newComponent as unknown as React.ReactNode);
      });

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
        Extrapolation.CLAMP,
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
      },
    );
    return () => backHandler.remove();
  }, [config.onBackButtonPress, hide, modalContent]);

  const isBackdropVisible = modalContent && !config.hideBackdrop;

  return (
    <FullWindowOverlay>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <AnimatedPressable
          pointerEvents={isBackdropVisible ? "auto" : "none"}
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
        {modalContent ? (
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
        ) : null}
      </View>
    </FullWindowOverlay>
  );
};
