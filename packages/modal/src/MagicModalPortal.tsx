import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutDown,
} from "react-native-reanimated";

import { ANIMATION_DURATION_IN_MS } from "./constants/animations";
import type { IModal, ModalChildren } from "./utils/magicModalHandler";
import {
  magicModal,
  magicModalRef,
  NewConfigProps,
} from "./utils/magicModalHandler";
import { styles } from "./MagicModalPortal.styles";
import { FullWindowOverlay } from "react-native-screens";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";

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
  const [config, setConfig] = useState<NewConfigProps>({});
  const [modalContent, setModalContent] = useState<React.ReactNode>(() => (
    <></>
  ));

  const onHideRef = useRef<GenericFunction>(() => {});

  const animationOutTiming =
    config?.animationOutTiming ?? ANIMATION_DURATION_IN_MS;

  const animationInTiming =
    config?.animationInTiming ?? ANIMATION_DURATION_IN_MS;

  const hide = useCallback<IModal["hide"]>(
    async (props) => {
      setIsVisible(false);

      await new Promise((resolve) => setTimeout(resolve, animationOutTiming));

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

      setModalContent(newComponent as unknown as React.ReactNode);
      setConfig(newConfig);
      setIsVisible(true);

      return new Promise((resolve) => {
        onHideRef.current = resolve;
      });
    },
  }));

  const direction = config?.direction ?? "bottom";

  const enteringAnimation = useMemo(() => {
    switch (direction) {
      case "top":
        return FadeInUp;
      case "bottom":
        return FadeInDown;
      case "left":
        return FadeInLeft;
      case "right":
        return FadeInRight;
    }
  }, [config?.direction]);

  const exitingAnimation = useMemo(() => {
    switch (direction) {
      case "top":
        return FadeOut;
      case "bottom":
        return FadeOutDown;
      case "left":
        return FadeOut;
      case "right":
        return FadeOut;
    }
  }, [config?.direction]);

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

  return (
    <FullWindowOverlay>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {isVisible ? (
          <AnimatedPressable
            disabled={config?.hideBackdrop}
            pointerEvents={config?.hideBackdrop ? "none" : "auto"}
            entering={FadeIn.duration(animationInTiming)}
            exiting={FadeOut.duration(animationInTiming)}
            style={[
              styles.backdrop,
              {
                backgroundColor: config.hideBackdrop
                  ? "transparent"
                  : config?.backdropColor ?? styles.backdrop.backgroundColor,
              },
            ]}
            onPress={onBackdropPress}
          >
            <Animated.View
              pointerEvents="box-none"
              entering={enteringAnimation.duration(animationInTiming)}
              exiting={exitingAnimation.duration(animationOutTiming)}
              style={[styles.overlay, styles.container, config?.style]}
            >
              {modalContent}
            </Animated.View>
          </AnimatedPressable>
        ) : null}
      </View>
    </FullWindowOverlay>
  );
};
