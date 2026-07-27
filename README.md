<h1 align="center">React Native Magic Modal 🦄</h1>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/50031755/182908700-6b94a470-0e5c-4af2-acba-b20acaffa0b8.png">
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/50031755/182908700-6b94a470-0e5c-4af2-acba-b20acaffa0b8.png">
  <img alt="React Native Magic Modal Banner" src="https://user-images.githubusercontent.com/50031755/182908700-6b94a470-0e5c-4af2-acba-b20acaffa0b8.png">
</picture>
<p align="center">
  <a aria-label="NPM Version" href="https://www.npmjs.com/package/react-native-magic-modal">
    <img alt="" src="https://img.shields.io/npm/v/react-native-magic-modal.svg?label=NPM&logo=npm&style=for-the-badge&color=0470FF&logoColor=white">
  </a>
  <a aria-label="NPM Download Count" href="https://www.npmjs.com/package/react-native-magic-modal">
    <img alt="" src="https://img.shields.io/npm/dt/react-native-magic-modal?label=Downloads&style=for-the-badge&color=67ACF3">
  </a>
  <a aria-label="License" href="https://www.npmjs.com/package/react-native-magic-modal">
    <img alt="" src="https://img.shields.io/npm/l/react-native-magic-modal?style=for-the-badge&color=F9DBBC">
  </a>
</p>
<p align="center">
  <a href="#documentation">Docs</a> | <a href="https://github.com/gstj/react-native-magic-modal">GitHub</a> | <a href="#faq">FAQ</a> | <a href="https://medium.com/@gabrieltaveira/you-have-been-using-react-native-modals-wrong-9b8c17de2f96">Article</a>
</p>

> [!NOTE]  
> Simplify your modal management in React Native with the **React Native Magic Modal** library. Effortlessly control modals, streamline complex flows, and create a seamless user experience.

> [!TIP]  
> Our new version just got released with full support for multiple modals! See the [breaking changes](https://github.com/GSTJ/react-native-magic-modal/releases).

## Features

- 📲 [**Easy Integration**](#quickstart): Seamlessly integrate with your React Native app.
- 🔄 [**Complex Flow Management**](#examples): Manage intricate modal sequences effortlessly.
- 🔧 [**Customizable**](#usage): Tailor modals to fit your app's unique requirements.

## Highlights

React Native Magic Modal offers a superior experience compared to traditional modal implementations:

- 🎨 [**Stylish and Responsive**](#examples): Designed to look great on both iOS and Android.
- 🚀 [**Developer Friendly**](#quickstart): Simple to use, with a focus on developer experience.
- 🧩 [**Versatile**](#documentation): Adaptable to a wide range of modal scenarios.

## Table of Contents

- [**Installation**](#installation)
- [**Quickstart**](#quickstart)
- [**Examples**](#examples)
- [**Documentation**](#documentation)
- [**FAQ**](#faq)
- [**Contributors**](#contributors)

## Installation

Add peer dependencies to your project, if you haven't already:

```bash
yarn add react-native-reanimated
yarn add react-native-gesture-handler
```

Install the package:

```bash
yarn add react-native-magic-modal
```

Minimum peer versions:

| Peer                           | Minimum |
| ------------------------------ | ------- |
| `react`                        | 18.0.0  |
| `react-native`                 | 0.81.0  |
| `react-native-gesture-handler` | 2.20.0  |
| `react-native-reanimated`      | 4.0.0   |

Both gesture-handler majors work. Swipe-to-dismiss uses 3.x's `usePanGesture` hook when it's available and falls back to 2.x's `Gesture.Pan()` builder when it isn't.

On Expo there's nothing to do: `npx expo install react-native-gesture-handler` gives you whatever your SDK bundles, which is 2.x on every SDK through 57, and `npx expo-doctor` stays clean. If you added `react-native-gesture-handler` to `expo.install.exclude` to quiet the version check on 8.0.0, drop it.

8.0.0 required gesture-handler 3.x. If you're on 8.0.0 and pinned to 2.x, upgrade to 8.1.0 or later.

## Quickstart

Insert a `MagicModalPortal` at the top of your application structure, and a `GestureHandlerRootView` if you haven't already:

```javascript
import { MagicModalPortal } from "react-native-magic-modal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView>
      <YourAppContent />
      <MagicModalPortal /> {/** After your app component hierarchy */}
    </GestureHandlerRootView>
  );
}
```

Tip: the root `_layout.tsx` is usually the best place to put it in a project using expo-router.

The `GestureHandlerRootView` is required. The portal renders a `GestureDetector` for the swipe gesture, and gesture-handler 3.x throws when one renders without a root view above it. 2.x only logs a warning.

## Examples

Showcasing modal management on iOS and Android platforms:

| iOS                                                                                                                           | Android                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://github.com/GSTJ/react-native-magic-modal/assets/50031755/fe95c4d9-3af5-4441-a36c-74dcb56ae78c" height=600/> | <img src="https://github.com/GSTJ/react-native-magic-modal/assets/50031755/f9effb46-7b5e-4371-a797-a84efb537346" height=600/> |

## Usage

Here's the preferred usage pattern for the library:

```js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  MagicModalPortal,
  magicModal,
  useMagicModal,
  MagicModalHideReason
} from "react-native-magic-modal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type ConfirmationModalReturn = {
  success: boolean;
};

const ConfirmationModal = () => {
  const { hide } = useMagicModal<ConfirmationModalReturn>();

  return (
    <View>
      <TouchableOpacity onPress={() => hide({ success: true })}>
        <Text>Click here to confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const ResponseModal = ({ text }) => {
  const { hide } = useMagicModal();

  return (
    <View>
      <Text>{text}</Text>
      <TouchableOpacity onPress={() => hide()}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const handleConfirmationFlow = async () => {
  // You can call `show` with or without props, depending on the requirements of the modal.
  const result = await magicModal.show<ConfirmationModalReturn>(() => <ConfirmationModal />).promise;

  // Hide could potentially be a backdrop press, a back button press, or a swipe gesture.
  if (result.reason !== MagicModalHideReason.INTENTIONAL_HIDE) {
    // User cancelled the flow
    return;
  }

  if (result.data.success) {
    return magicModal.show(() => <ResponseModal text="Success!" />).promise;
  }

  return magicModal.show(() => <ResponseModal text="Failure :(" />).promise;
};

export const MainScreen = () => {
  return (
    <GestureHandlerRootView>
      <TouchableOpacity onPress={handleConfirmationFlow}>
        <Text>Start the modal flow!</Text>
      </TouchableOpacity>
      <MagicModalPortal />
    </GestureHandlerRootView>
  );
};
```

You can also hide modals imperatively outside of the modal context. For that, we provide the global `hide` method, that requires a modal id:

```js
import { magicModal } from "react-native-magic-modal";

const QuickModal = ({ text }) => {
  return (
    <View>
      <Text>Hey! I'm going to be closed imperatively</Text>
    </View>
  );
};

const handleQuickModal = async () => {
  const { modalID } = magicModal.show(QuickModal);

  // Wait for 2 seconds before closing the modal
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Note that it's usually preferrable to use the `hide` method from the modal context
  // You can even put it inside useEffects to handle auto-dismissal for you.
  magicModal.hide(undefined, { modalID });
};

export const MainScreen = () => {
  return (
    <GestureHandlerRootView>
      <TouchableOpacity onPress={handleQuickModal}>
        <Text>Show a quick modal</Text>
      </TouchableOpacity>
      <MagicModalPortal />
    </GestureHandlerRootView>
  );
};
```

`show` also hands you an `update` function, for when the data driving the modal lives outside of it:

```js
import { magicModal } from "react-native-magic-modal";

const UploadModal = ({ progress }) => (
  <View>
    <Text>Uploading, {progress}%</Text>
  </View>
);

const handleUpload = async (file) => {
  const { modalID, update } = magicModal.show(() => (
    <UploadModal progress={0} />
  ));

  await uploadFile(file, {
    onProgress: (progress) => update(() => <UploadModal progress={progress} />),
  });

  magicModal.hide(undefined, { modalID });
};
```

The modal itself stays put: same position in the stack, same backdrop, and the promise from `show` keeps waiting. Only the content is swapped, and it's a new component, so it mounts from scratch and anything it kept in `useState` is gone. If the state belongs to the modal, drive it from inside with a store or context instead.

Refer to the [kitchen-sink example](examples/kitchen-sink) for detailed usage scenarios.

## Documentation

Access the complete documentation [here](https://gstj.github.io/react-native-magic-modal/).

## FAQ

**Q:** Can I have two modals showing up at the same time?

**A:** Yes. With v4+, you can now have multiple modals showing up at the same time.

---

**Q:** Can I use Scrollables inside the modal?

**A:**
Yes, but Scrollables can't be used with swipe gestures enabled, as they conflict. Pass in `swipeDirection: undefined` on the `magicModal.show` function to disable gestures on them.

If your use-case is a scrollable bottom-sheet, I recommend going with Gorhom's react-native-bottom-sheet for this use-case temporarily.

---

**Q:** Modals are appearing on top of native modal screens, such as the image picker. How can I fix this?

**A:**
This behavior can be disabled by calling `magicModal.disableFullWindowOverlay()` before showing the modal. This will prevent the modal from appearing on top of native modal screens.

You can also call `magicModal.enableFullWindowOverlay()` to re-enable it.

## Contributors

Special thanks to everyone who contributed to making React Native Magic Modal a robust and user-friendly library. [See the full list](https://github.com/GSTJ/react-native-magic-modal/graphs/contributors).

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository.

## License

React Native Magic Modal is licensed under the [MIT License](LICENSE).
