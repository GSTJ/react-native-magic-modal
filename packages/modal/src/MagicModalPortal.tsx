import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { ANIMATION_DURATION_IN_MS } from "./constants/animations";
import type { IModal, ModalChildren } from "./utils/magicModalHandler";
import {
  magicModal,
  magicModalRef,
  NewConfigProps,
} from "./utils/magicModalHandler";
import { styles } from "./MagicModalPortal.styles";
import { FullWindowOverlay } from "react-native-screens";
import {
  BackHandler,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export type ModalProps = {
  animationInTiming: number;
  animationOutTiming: number;
  hideBackdrop: boolean;
  backdropColor: string;
  onBackButtonPress: () => void;
  onBackdropPress: () => void;
  style: Record<string, unknown>;
  direction: "top" | "bottom" | "left" | "right";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFunction = (props: any) => any;

export enum MagicModalHideTypes {
  BACKDROP_PRESSED = "BACKDROP_PRESSED",
  SWIPE_COMPLETED = "SWIPE_COMPLETED",
  BACK_BUTTON_PRESSED = "BACK_BUTTON_PRESSED",
  MODAL_OVERRIDE = "MODAL_OVERRIDE",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modalRefForTests = React.createRef<any>();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MagicModalPortal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<NewConfigProps>({});
  const [modalContent, setModalContent] = useState<React.ReactNode>(() => (
    <></>
  ));

  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  const onHideRef = useRef<GenericFunction>(() => {});

  const animationOutTiming =
    config?.animationOutTiming ?? ANIMATION_DURATION_IN_MS;

  const animationInTiming =
    config?.animationInTiming ?? ANIMATION_DURATION_IN_MS;

  const hide = useCallback<IModal["hide"]>(
    async (props) => {
      if (direction === "left") {
        translationX.value = withSpring(width, {
          duration: animationOutTiming,
          dampingRatio: 3,
        });
      }

      if (direction === "right") {
        translationX.value = withSpring(-width, {
          duration: animationOutTiming,
          dampingRatio: 3,
        });
      }

      if (direction === "top") {
        translationY.value = withSpring(-height, {
          duration: animationOutTiming,
          dampingRatio: 3,
        });
      }

      if (direction === "bottom") {
        translationY.value = withSpring(height, {
          duration: animationOutTiming,
          dampingRatio: 3,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, animationOutTiming));

      setIsVisible(false);

      onHideRef.current(props);
    },
    [animationOutTiming]
  );

  useImperativeHandle(magicModalRef, () => ({
    hide,
    show: async (
      newComponent: ModalChildren,
      newConfig: Partial<ModalProps> = {}
    ) => {
      if (isVisible) await hide(MagicModalHideTypes.MODAL_OVERRIDE);

      // Reset the translation values
      translationX.value = 0;
      translationY.value = 0;

      prevTranslationX.value = 0;
      prevTranslationY.value = 0;

      setModalContent(newComponent as unknown as React.ReactNode);
      setConfig(newConfig);
      setIsVisible(true);

      return new Promise((resolve) => {
        onHideRef.current = resolve;
      });
    },
  }));

  const direction = config?.direction ?? "bottom";

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (config?.onBackButtonPress) {
          config.onBackButtonPress();
        } else {
          magicModal.hide(MagicModalHideTypes.BACK_BUTTON_PRESSED);
        }

        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  const onBackdropPress = useMemo(() => {
    if (config?.onBackdropPress) {
      return config.onBackdropPress;
    }

    return () => magicModal.hide(MagicModalHideTypes.BACKDROP_PRESSED);
  }, [config?.onBackdropPress]);

  const { width, height } = useWindowDimensions();

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      const maxTranslateX = width / 2 - 50;
      const maxTranslateY = height / 2 - 50;

      if (direction === "left") {
        translationX.value = clamp(
          prevTranslationX.value + event.translationX,
          -maxTranslateX,
          0
        );
      }

      if (direction === "right") {
        translationX.value = clamp(
          prevTranslationX.value + event.translationX,
          0,
          maxTranslateX
        );
      }

      if (direction === "top") {
        translationY.value = clamp(
          prevTranslationY.value + event.translationY,
          -maxTranslateY,
          0
        );
      }

      if (direction === "bottom") {
        translationY.value = clamp(
          prevTranslationY.value + event.translationY,
          0,
          maxTranslateY
        );
      }
    })
    .onEnd((event) => {
      // Check the direction and velocity of the swipe
      if (direction === "right" && event.velocityX > 500) {
        magicModal.hide(MagicModalHideTypes.SWIPE_COMPLETED);
        return;
      } else if (direction === "left" && event.velocityX < 500) {
        magicModal.hide(MagicModalHideTypes.SWIPE_COMPLETED);
        return;
      } else if (direction === "top" && event.velocityY < 500) {
        magicModal.hide(MagicModalHideTypes.SWIPE_COMPLETED);
        return;
      } else if (direction === "bottom" && event.velocityY > 500) {
        magicModal.hide(MagicModalHideTypes.SWIPE_COMPLETED);
        return;
      }

      // Reset the translation values
      translationX.value = withSpring(0, {
        velocity: event.velocityX,
        damping: 15,
      });
      translationY.value = withSpring(0, {
        velocity: event.velocityY,
        damping: 15,
      });
    })
    .runOnJS(true);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  return (
    <FullWindowOverlay>
      <GestureHandlerRootView
        pointerEvents="box-none"
        style={StyleSheet.absoluteFill}
      >
        {isVisible ? (
          <>
            <AnimatedPressable
              pointerEvents={config?.hideBackdrop ? "none" : "auto"}
              style={[
                styles.backdrop,
                {
                  backgroundColor: config.hideBackdrop
                    ? "transparent"
                    : config?.backdropColor ?? styles.backdrop.backgroundColor,
                },
              ]}
              onPress={onBackdropPress}
            />
            <Animated.View
              pointerEvents={"box-none"}
              style={[
                animatedStyles,
                styles.overlay,
                styles.container,
                config?.style,
              ]}
            >
              <GestureDetector gesture={pan}>{modalContent}</GestureDetector>
            </Animated.View>
          </>
        ) : null}
      </GestureHandlerRootView>
    </FullWindowOverlay>
  );
};
