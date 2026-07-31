import React from "react";

import { Stack } from "expo-router";

import { MagicModalPortal } from "magic-modal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const App = () => {
  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="swipe" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
      <MagicModalPortal />
    </GestureHandlerRootView>
  );
};

export default App;
