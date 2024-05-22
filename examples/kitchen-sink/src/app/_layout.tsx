import { MagicModalPortal } from "@magic/react-native-magic-modal";
import { Stack } from "expo-router";
import React from "react";

const App = () => {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
      <MagicModalPortal />
    </>
  );
};

export default App;
