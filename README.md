<p align="center">
  <img
    alt="A rating flow moving from magicModal.show to a typed close result"
    src="https://raw.githubusercontent.com/GSTJ/react-native-magic-modal/main/media/magic-modal-demo.gif"
  />
</p>

<p align="center">Mount one portal. Open a modal from any async flow and await a typed result on Expo, React Native, or the web.</p>

<p align="center">
  <a aria-label="npm version" href="https://www.npmjs.com/package/react-native-magic-modal"><img alt="npm version" src="https://shieldcn.dev/npm/react-native-magic-modal.svg?variant=branded&amp;size=xs&amp;mode=light" /></a>
  <a aria-label="npm downloads" href="https://www.npmjs.com/package/react-native-magic-modal"><img alt="npm downloads" src="https://shieldcn.dev/npm/react-native-magic-modal/downloads.svg?variant=branded&amp;size=xs&amp;mode=light" /></a>
  <a aria-label="GitHub stars" href="https://github.com/GSTJ/react-native-magic-modal/stargazers"><img alt="GitHub stars" src="https://shieldcn.dev/github/GSTJ/react-native-magic-modal/stars.svg?variant=branded&amp;size=xs&amp;mode=light" /></a>
  <a aria-label="license" href="https://github.com/GSTJ/react-native-magic-modal/blob/main/LICENSE"><img alt="license" src="https://shieldcn.dev/github/GSTJ/react-native-magic-modal/license.svg?variant=branded&amp;size=xs&amp;mode=light" /></a>
</p>

<p align="center">
  <a href="https://gstj.github.io/react-native-magic-modal/docs/">Docs</a> | <a href="https://github.com/gstj/react-native-magic-modal">GitHub</a> | <a href="https://gstj.github.io/react-native-magic-modal/docs/faq/">FAQ</a> | <a href="https://medium.com/@gabrieltaveira/you-have-been-using-react-native-modals-wrong-9b8c17de2f96">Article</a>
</p>

## How it works

1. `MagicModalPortal` owns the modal stack. Mount it once, near the root.
2. `magicModal.show()` pushes one entry and returns an awaitable handle.
3. `useMagicModal().hide(data)` closes that entry with typed data.
4. The handle resolves to `HideReturn<T>`, including the close reason.

The handle is the promise itself, carrying that entry's `modalID`, `update`, and `hide`. The caller
resumes with submitted data or the exact dismissal reason.

```tsx
const result = await magicModal.show<ConfirmationResult>(ConfirmationModal, {
  accessibilityLabel: "Confirm publish",
});

if (result.reason === MagicModalHideReason.INTENTIONAL_HIDE) {
  await publish(result.data);
} else {
  recordCancellation(result.reason);
}
```

`const { promise, modalID, update } = magicModal.show(...)` still works; `promise` is a deprecated
alias of the handle itself.

Every stack entry keeps its own component, configuration, ID, and promise. A second `show()` call
can open above the current modal without mixing their results.

## Installation

Expo chooses versions compatible with the installed SDK.

### Expo Web

```bash
pnpm add react-native-magic-modal
npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets react-dom react-native-web @expo/metro-runtime
```

Read the [Expo guide](https://gstj.github.io/react-native-magic-modal/docs/platforms/expo/) for the
portal and web command.

### Expo iOS

```bash
pnpm add react-native-magic-modal
npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets react-native-screens
```

### Expo Android

```bash
pnpm add react-native-magic-modal
npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets react-native-screens
```

iOS and Android use the same native dependency set. The
[native guide](https://gstj.github.io/react-native-magic-modal/docs/platforms/ios-android/) covers
pods, Android back handling, and iOS overlays.

### Next.js

```bash
pnpm add react-native-magic-modal react-native react-native-web react-native-gesture-handler react-native-reanimated react-native-worklets
```

Copy the validated alias, extension order, and Client Component setup from the
[Next.js guide](https://gstj.github.io/react-native-magic-modal/docs/platforms/nextjs/). A runnable
App Router consumer lives in [`examples/next-web`](examples/next-web).

For bare React Native, follow the
[installation guide](https://gstj.github.io/react-native-magic-modal/docs/getting-started/installation/).

## Mount the portal

Expo and native applications mount one portal inside `GestureHandlerRootView`:

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MagicModalPortal } from "react-native-magic-modal";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <YourApp />
      <MagicModalPortal />
    </GestureHandlerRootView>
  );
}
```

With Expo Router, put the same structure in the root `app/_layout.tsx`. Next.js mounts the portal
inside a Client Component as shown in the [web setup](https://gstj.github.io/react-native-magic-modal/docs/platforms/nextjs/).

## Return typed data

Use the same result type in `show<T>()` and `useMagicModal<T>()`:

```tsx
import { Pressable, Text, View } from "react-native";
import { MagicModalHideReason, magicModal, useMagicModal } from "react-native-magic-modal";

type ConfirmationResult = {
  confirmed: boolean;
};

function ConfirmationModal() {
  const { hide } = useMagicModal<ConfirmationResult>();

  return (
    <View>
      <Text accessibilityRole="header">Publish this release?</Text>
      <Pressable accessibilityRole="button" onPress={() => hide({ confirmed: true })}>
        <Text>Publish</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => hide({ confirmed: false })}>
        <Text>Cancel</Text>
      </Pressable>
    </View>
  );
}

export async function confirmRelease() {
  const result = await magicModal.show<ConfirmationResult>(ConfirmationModal, {
    accessibilityLabel: "Publish this release",
  });

  if (result.reason !== MagicModalHideReason.INTENTIONAL_HIDE) {
    return { confirmed: false, reason: result.reason };
  }

  return result.data;
}
```

Backdrop presses, completed swipes, system-dismiss actions, and `hideAll()` resolve the same promise
with distinct reasons. System dismissal includes Android back, web Escape, and the native
accessibility escape action. TypeScript exposes `data` after the caller narrows the result to
`INTENTIONAL_HIDE`.

## Documentation

- [Expo Web, iOS, and Android](https://gstj.github.io/react-native-magic-modal/docs/platforms/expo/)
- [Next.js and React Native Web](https://gstj.github.io/react-native-magic-modal/docs/platforms/nextjs/)
- [Modal flows and stacks](https://gstj.github.io/react-native-magic-modal/docs/guides/modal-flows/)
- [Hide results](https://gstj.github.io/react-native-magic-modal/docs/reference/hide-results/)
- [Accessibility](https://gstj.github.io/react-native-magic-modal/docs/guides/accessibility/)
- [Advanced content replacement](https://gstj.github.io/react-native-magic-modal/docs/guides/updating-content/)

The [kitchen-sink Expo app](examples/kitchen-sink) contains runnable native flows. The
[interactive site](https://gstj.github.io/react-native-magic-modal/) runs the package in the
browser.

## FAQ

### Can multiple modals be open?

Yes. Every `show()` call creates an independent stack entry with its own ID, configuration, and
promise.

### Can a modal contain a ScrollView?

Yes. Disable swipe dismissal:

```tsx
magicModal.show(ScrollableModal, {
  swipeDirection: undefined,
});
```

Magic Modal doesn't implement snap points or nested scrolling.

### How do I close a modal from outside its component?

Keep the ID returned by `show()`:

```tsx
const { modalID } = magicModal.show(StatusModal);
magicModal.hide(undefined, { modalID });
```

Inside modal content, use `useMagicModal().hide()`.

### How do I render below a native picker on iOS?

Temporarily call `magicModal.disableFullWindowOverlay()`. Restore it in a `finally` block after the
picker closes. The [native overlay guide](https://gstj.github.io/react-native-magic-modal/docs/guides/native-overlays/)
contains the complete pattern.

## Contributors

[See everyone who has contributed](https://github.com/GSTJ/react-native-magic-modal/graphs/contributors)
and read the [contributing guide](CONTRIBUTING.md).

## License

React Native Magic Modal is licensed under the [MIT License](LICENSE).
