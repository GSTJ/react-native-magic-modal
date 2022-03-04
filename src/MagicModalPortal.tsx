import React, {
  useState,
  useImperativeHandle,
  useCallback,
  useRef,
} from 'react';
import { ANIMATION_DURATION_IN_MS } from './constants/animations';
import { Dimensions, ViewProps } from 'react-native';
import { styles } from './MagicModalPortal.styles';
import ModalContainer, { ModalProps } from 'react-native-modal';
import { modalAnimationTimeout } from './utils/modalAnimationTimeout';
import {
  type ModalChildren,
  type IModal,
  magicModalRef,
} from './utils/magicModalHandler';

const { width, height } = Dimensions.get('screen');

type GenericFunction = (props: any) => any;

export enum MagicModalHideTypes {
  BACKDROP_PRESSED = 'BACKDROP_PRESSED',
  SWIPE_COMPLETED = 'SWIPE_COMPLETED',
  BACK_BUTTON_PRESSED = 'BACK_BUTTON_PRESSED',
  MODAL_OVERRIDE = 'MODAL_OVERRIDE',
}

export const modalRefForTests = React.createRef<any>();

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
  const [config, setConfig] = useState<ViewProps>({});
  const [modalContent, setModalContent] = useState<ModalChildren>(() => <></>);

  const onHideRef = useRef<GenericFunction>(() => {});

  const hide = useCallback<IModal['hide']>(async (props) => {
    setIsVisible(false);
    await modalAnimationTimeout();
    onHideRef.current(props);
  }, []);

  useImperativeHandle(magicModalRef, () => ({
    hide,
    show: async (
      newComponent: ModalChildren,
      newConfig: Partial<ModalProps> = {}
    ) => {
      if (isVisible) await hide(MagicModalHideTypes.MODAL_OVERRIDE);

      setModalContent(newComponent);
      setConfig(newConfig);
      setIsVisible(true);

      return new Promise((resolve) => {
        onHideRef.current = resolve;
      });
    },
  }));

  return (
    <ModalContainer
      ref={modalRefForTests}
      backdropTransitionOutTiming={0}
      avoidKeyboard={true}
      swipeDirection={'down'}
      deviceHeight={height}
      deviceWidth={width}
      animationOutTiming={ANIMATION_DURATION_IN_MS}
      statusBarTranslucent={true}
      onBackdropPress={() => hide(MagicModalHideTypes.BACKDROP_PRESSED)}
      onSwipeComplete={() => hide(MagicModalHideTypes.SWIPE_COMPLETED)}
      onBackButtonPress={() => hide(MagicModalHideTypes.BACK_BUTTON_PRESSED)}
      isVisible={isVisible}
      {...config}
      style={[styles.container, config?.style]}
    >
      {modalContent}
    </ModalContainer>
  );
};
