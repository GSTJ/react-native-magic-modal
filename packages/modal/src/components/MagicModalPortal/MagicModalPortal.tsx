import React, { memo, useEffect, useImperativeHandle, useMemo } from "react";
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
  MagicModalHideTypes,
  Direction,
} from "../../constants/types";
import { defaultConfig, defaultDirection } from "../../constants/defaultConfig";
import { magicModalRef } from "../../utils/magicModalHandler";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const defaultAnimationInMap = {
  up: FadeInUp,
  down: FadeInDown,
  left: FadeInLeft,
  right: FadeInRight,
} satisfies Record<Direction, unknown>;

const defaultAnimationOutMap = {
  up: FadeOutUp,
  down: FadeOutDown,
  left: FadeOutLeft,
  right: FadeOutRight,
} satisfies Record<Direction, unknown>;

const MagicModalContext = React.createContext<{
  hide: (props: any) => Promise<unknown>;
}>({
  hide: async () => {},
});

export const useMagicModal = () => {
  const context = React.useContext(MagicModalContext);

  if (!context) {
    throw new Error("useMagicModal must be used within a MagicModalProvider");
  }

  return context;
};

const MagicModal = ({
  config,
  children: Children,
}: {
  config: ModalProps;
  children: React.ReactNode;
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
    [height, width]
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
          success && runOnJS(hide)(MagicModalHideTypes.SWIPE_COMPLETED)
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
    [translationX.value, translationY.value]
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
        Extrapolation.CLAMP
      ),
    };
  }, [config.swipeDirection, translationX.value, translationY.value, rangeMap]);

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
};

const MagicModalProvider = ({
  children,
  hide,
}: {
  children: React.ReactNode;

  hide: (props?: unknown) => Promise<unknown>;
}) => {
  const value = useMemo(() => ({ hide }), [hide]);

  return (
    <MagicModalContext.Provider value={value}>
      {children}
    </MagicModalContext.Provider>
  );
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
export const MagicModalPortal: React.FC = memo(() => {
  const [modals, setModals] = React.useState<
    {
      id: string;
      component: React.ReactNode;
      config: ModalProps;
      hideCallback: (props: unknown) => unknown;
    }[]
  >([]);

  const hide = async (
    props: unknown,
    {
      modalID,
    }: {
      modalID?: string;
    } = {}
  ) => {
    if (!modals.length) {
      throw new Error("No modals visible to hide");
    }

    const currentModal = modals.find((modal) => modal.id === modalID);

    if (!modalID) {
      // eslint-disable-next-line no-console
      console.warn(
        "No modal id provided to hide. Defaulting to the last modal in the stack.\nPlease provide a modal id to hide or use the preferred useMagicModal hook inside the modal to hide itself."
      );
    } else if (!currentModal) {
      throw new Error(`No modal found with id: ${modalID}`);
    }

    const safeModal = currentModal || modals[modals.length - 1]!;

    setModals((prevModals) =>
      prevModals.filter((modal) => modal.id !== safeModal.id)
    );

    new Promise<void>((resolve) => {
      setTimeout(resolve, safeModal.config.animationOutTiming);
    });

    return safeModal.hideCallback(props);
  };

  const show = async (
    newComponent: React.ReactNode,
    newConfig?: ModalProps
  ) => {
    const id = `${Date.now()}`;

    let hideCallback: (props: unknown) => unknown;

    const hidePromise = new Promise((resolve) => {
      hideCallback = resolve;
    });

    setModals((prevModals) => [
      ...prevModals,
      {
        id,
        component: newComponent,
        config: { ...defaultConfig, ...newConfig },
        hideCallback,
      },
    ]);

    return hidePromise;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const lastModal = modals[modals.length - 1];

        if (!lastModal) {
          return false;
        }

        if (lastModal.config.onBackButtonPress) {
          lastModal.config.onBackButtonPress();
        } else {
          hide(MagicModalHideTypes.BACK_BUTTON_PRESSED, {
            modalID: lastModal.id,
          });
        }

        return true;
      }
    );
    return () => backHandler.remove();
  }, [hide, modals]);

  useImperativeHandle(magicModalRef, () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    show: show as any,
    hide,
  }));

  /* This needs to always be rendered, if we make it conditionally render based on ModalContent too,
     the modal will have zIndex issues on react-navigation modals. */
  return (
    <FullWindowOverlay>
      {modals.map(({ id, component, config }) => (
        <MagicModalProvider
          key={id}
          hide={(props?: unknown) => hide(props, { modalID: id })}
        >
          <MagicModal config={config}>{component}</MagicModal>
        </MagicModalProvider>
      ))}
    </FullWindowOverlay>
  );
});
