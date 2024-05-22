import { MagicModalPortal } from "@magic/react-native-magic-modal";
import { Slot } from "expo-router";
import React from "react";

const App = () => {
  return (
    <>
      <Slot />
      <MagicModalPortal />
    </>
  );
};

export default App;
