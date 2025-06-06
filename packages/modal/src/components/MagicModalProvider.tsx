import React, { memo, useMemo } from "react";

import type { HookHideFunction } from "../constants/types";
import { MagicModalHideReason } from "../constants/types";

const MagicModalContext = React.createContext<{
  hide: HookHideFunction;
}>({
  hide: () => {},
});

export const useInternalMagicModal = () => {
  const context = React.useContext(MagicModalContext);
  return context;
};

/**
 * A hook to hide the modal from inside the modal component.
 * @example
 * ```tsx
 * const { hide } = useMagicModal<{ message: string }>();
 *
 * return (
 *   <Pressable onPress={() => hide({ message: "hey" })}>
 *     <Text>Test!</Text>
 *   </Pressable>
 * );
 * ```
 */
export const useMagicModal = <T = void,>() => {
  const context = useInternalMagicModal();

  return useMemo(
    () => ({
      hide: (data: T) => {
        context.hide({
          reason: MagicModalHideReason.INTENTIONAL_HIDE,
          data,
        });
      },
    }),
    [context],
  );
};

export const MagicModalProvider = memo(
  ({
    children,
    hide,
  }: {
    children: React.ReactNode;
    hide: HookHideFunction;
  }) => {
    const value = useMemo(() => ({ hide }), [hide]);

    return (
      <MagicModalContext.Provider value={value}>
        {children}
      </MagicModalContext.Provider>
    );
  },
);
