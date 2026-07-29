<h1 align="center">React Native Magic Modal</h1>

<p align="center">Call <code>show()</code> from any async flow. Await a typed result that records how the modal closed.</p>

<a href="./media/magic-modal-demo.mp4">
  <img
    alt="A rating flow moving from magicModal.show to a typed close result"
    src="./media/magic-modal-demo.gif"
  />
</a>

<p align="center"><a href="./media/magic-modal-demo.mp4">Watch the MP4</a></p>

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
  <a href="https://gstj.github.io/react-native-magic-modal/docs/">Docs</a> | <a href="https://github.com/gstj/react-native-magic-modal">GitHub</a> | <a href="https://gstj.github.io/react-native-magic-modal/docs/faq/">FAQ</a> | <a href="https://medium.com/@gabrieltaveira/you-have-been-using-react-native-modals-wrong-9b8c17de2f96">Article</a>
</p>

> [!NOTE]
> Magic Modal owns the flow. Your components own the UI. Open a modal from anywhere and await its typed result.

> [!TIP]
> Guides and API reference live in the [documentation](https://gstj.github.io/react-native-magic-modal/docs/).

## Core API

- `magicModal.show()` renders content in the portal and returns an entry handle with a promise.
- `modalID` targets one entry for an update or close.
- `update()` replaces the component rendered by an open entry.
- `HideReturn<T>` records how the modal closed and carries submitted data.
- Modal components remain ordinary React Native UI.

## Table of Contents

- [Installation](#installation)
- [Quickstart](#quickstart)
- [Try it](#try-it)
- [Documentation](#documentation)
- [FAQ](#faq)
- [Contributors](#contributors)

## Installation

Install the package and its native peers:

```bash
pnpm add react-native-magic-modal react-native-gesture-handler react-native-reanimated react-native-worklets react-native-screens
```

Minimum peer versions:

| Peer                           | Minimum |
| ------------------------------ | ------- |
| `react`                        | 18.0.0  |
| `react-native`                 | 0.81.0  |
| `react-native-gesture-handler` | 2.20.0  |
| `react-native-reanimated`      | 4.1.0   |
| `react-native-worklets`        | 0.5.0   |
| `react-native-screens`         | 4.19.0  |

Both gesture-handler majors work. Swipe-to-dismiss uses 3.x's `usePanGesture` hook when it's available and falls back to 2.x's `Gesture.Pan()` builder otherwise.

Reanimated 4 requires React Native's New Architecture. In a bare React Native app, add `"react-native-worklets/plugin"` last in `babel.config.js`. Run `npx pod-install`. Expo configures the plugin through its Babel preset; install compatible native versions with:

```bash
npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets react-native-screens
pnpm add react-native-magic-modal
```

Only 8.0.0 required gesture-handler 3.x. If you're on it and pinned to 2.x, upgrade to 9.0.0 or later, and drop `react-native-gesture-handler` from `expo.install.exclude` if you added it to quiet the version check.

## Quickstart

Mount a `MagicModalPortal` at the app root, and add a `GestureHandlerRootView` if you haven't already:

```tsx
import { MagicModalPortal } from "react-native-magic-modal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <YourAppContent />
      <MagicModalPortal /> {/** After your app component hierarchy */}
    </GestureHandlerRootView>
  );
}
```

In Expo Router, mount it in the root `_layout.tsx`.

The `GestureHandlerRootView` is required. The portal renders a `GestureDetector` for the swipe gesture, and gesture-handler 3.x throws when one renders without a root view above it. 2.x only logs a warning.

## Try it

The [interactive docs](https://gstj.github.io/react-native-magic-modal/) run the
package directly in the browser. Try the mobile rating flow, stack a second
caller, or watch `update()` drive a web upload.

The [kitchen-sink app](examples/kitchen-sink) covers the native iOS and Android
paths.

## Usage

Start with a modal that returns data to its caller:

```tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { magicModal, useMagicModal, MagicModalHideReason } from "react-native-magic-modal";

type ConfirmationModalReturn = {
  success: boolean;
};

const ConfirmationModal = () => {
  const { hide } = useMagicModal<ConfirmationModalReturn>();

  return (
    <View>
      <TouchableOpacity onPress={() => hide({ success: true })}>
        <Text>Confirm</Text>
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
  // The render callback can pass props to the modal.
  const result = await magicModal.show<ConfirmationModalReturn>(() => <ConfirmationModal />)
    .promise;

  // Non-intentional closes include backdrop presses, Android back presses, and swipes.
  if (result.reason !== MagicModalHideReason.INTENTIONAL_HIDE) {
    // User cancelled the flow
    return;
  }

  if (result.data.success) {
    return magicModal.show(() => <ResponseModal text="Confirmed." />).promise;
  }

  return magicModal.show(() => <ResponseModal text="Confirmation failed." />).promise;
};

export const MainScreen = () => {
  return (
    <TouchableOpacity onPress={handleConfirmationFlow}>
      <Text>Start confirmation flow</Text>
    </TouchableOpacity>
  );
};
```

You can also close a modal outside its component. Pass its `modalID` to the
global `hide` method:

```tsx
import { magicModal } from "react-native-magic-modal";

const QuickModal = ({ text }) => {
  return (
    <View>
      <Text>The caller will close this modal.</Text>
    </View>
  );
};

const handleQuickModal = async () => {
  const { modalID } = magicModal.show(QuickModal);

  // Wait for 2 seconds before closing the modal
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Prefer hide() from the modal context when the modal owns the close action.
  // Call it from an effect to auto-dismiss the modal.
  magicModal.hide(undefined, { modalID });
};

export const MainScreen = () => {
  return (
    <TouchableOpacity onPress={handleQuickModal}>
      <Text>Show a quick modal</Text>
    </TouchableOpacity>
  );
};
```

`show` also returns `update()` for data that lives outside the modal:

```tsx
import { magicModal } from "react-native-magic-modal";

const UploadModal = ({ progress }) => (
  <View>
    <Text>Uploading, {progress}%</Text>
  </View>
);

const handleUpload = async (file) => {
  const { modalID, update } = magicModal.show(() => <UploadModal progress={0} />);

  await uploadFile(file, {
    onProgress: (progress) => update(() => <UploadModal progress={progress} />),
  });

  magicModal.hide(undefined, { modalID });
};
```

The entry keeps its stack position, backdrop, and pending promise. Only the
component changes. It mounts from scratch, so local `useState` resets. Keep
modal-owned state in a store or context when it must survive an update.

See the [kitchen-sink example](examples/kitchen-sink) for runnable iOS and Android flows.

## Documentation

Read the [setup, guides, and API reference](https://gstj.github.io/react-native-magic-modal/).

## FAQ

**Q:** Can two modals be open at once?

**A:** Yes. Every `show()` call adds an independent stack entry with its own ID
and promise.

---

**Q:** Can I put scrollable content inside a modal?

**A:**
Yes, but the scroll gesture conflicts with swipe dismissal. Pass
`swipeDirection: undefined` to `magicModal.show()` for a scrollable modal.

For a full bottom-sheet component, use
[React Native Bottom Sheet](https://github.com/gorhom/react-native-bottom-sheet).

---

**Q:** Modals are appearing on top of native modal screens, such as the image picker. How can I fix this?

**A:**
Call `magicModal.disableFullWindowOverlay()` before opening the modal.

Call `magicModal.enableFullWindowOverlay()` when the overlay should cover native
screens again.

## Contributors

[See everyone who has contributed](https://github.com/GSTJ/react-native-magic-modal/graphs/contributors).

See the [contributing guide](CONTRIBUTING.md).

## License

React Native Magic Modal is licensed under the [MIT License](LICENSE).
