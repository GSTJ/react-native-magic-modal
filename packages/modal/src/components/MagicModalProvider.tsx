import React, { memo, useMemo } from "react";

import { HookHideFunction } from "../constants/types";

const MagicModalContext = React.createContext<{
  hide: HookHideFunction;
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
