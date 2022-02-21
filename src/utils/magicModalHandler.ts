import React from 'react';
import type { ModalProps } from 'react-native-modal';

export type ModalChildren = React.FC;

export interface IModal {
  show: (
    newComponent: ModalChildren,
    newConfig?: Partial<ModalProps>
  ) => Promise<void>;
  hide: (props?: any) => Promise<void>;
}

export const magicModalRef = React.createRef<IModal>();

export const magicModalHandler: IModal = {
  show: async (newComponent, newConfig) =>
    magicModalRef.current?.show?.(newComponent, newConfig),
  hide: async (props) => magicModalRef.current?.hide?.(props),
};
