import React, { memo, useMemo } from "react";

import { HookHideFunction, MagicModalHideReason } from "../constants/types";

const MagicModalContext = React.createContext<{
  hide: HookHideFunction;
}>({
  hide: async () => {},
});

export const useInternalMagicModal = () => {
  const context = React.useContext(MagicModalContext);

  if (!context) {
    throw new Error(
      "useInternalMagicModal must be used within a MagicModalProvider",
    );
  }

  return context;
};

/**
 * A hook to hide the modal from inside the modal component.
 * @example
 * ```tsx
 * const { hide } = useMagicModal<{ message: string }>();
 *
 * return (
 *   <TouchableOpacity onPress={() => hide({ message: "hey" })}>
 *     <Text>Test!</Text>
 *   </TouchableOpacity>
 * );
 * ```
 */
export const useMagicModal = <T = void,>() => {
  const context = useInternalMagicModal();

  return useMemo(
    () => ({
      hide: (data: T) =>
        context.hide({
          reason: MagicModalHideReason.INTENTIONAL_HIDE,
          data,
        }),
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
