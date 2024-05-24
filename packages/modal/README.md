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

## Quickstart

Insert a `MagicModalPortal` at the top of your application structure, and a GestureHandlerRootView if you haven't already:

```javascript
import { MagicModalPortal } from "react-native-magic-modal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView>
      <MagicModalPortal /> {/** At the top of your app component hierarchy */}
      <YourAppContent />
    </GestureHandlerRootView>
  );
}
```

Tip: the root `_layout.tsx` is usually the best place to put it in a project using expo-router.

## Examples

Showcasing modal management on iOS and Android platforms:

| iOS                                                                                                                           | Android                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://user-images.githubusercontent.com/50031755/155215573-df8f20fb-9b3f-4ce6-9d48-2afa8cb41daa.gif" height=600/> | <img src="https://user-images.githubusercontent.com/50031755/155215547-d2b45f33-264e-4c90-8ff1-e33b72e2c3b1.gif" height=600/> |

## Usage

```js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MagicModalPortal, magicModal } from "react-native-magic-modal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const ConfirmationModal = () => (
  <View>
    <TouchableOpacity onPress={() => magicModal.hide({ success: true })}>
      <Text>Click here to confirm</Text>
    </TouchableOpacity>
  </View>
);

const ResponseModal = ({ text }) => (
  <View>
    <Text>{text}</Text>
    <TouchableOpacity onPress={() => magicModal.hide()}>
      <Text>Close</Text>
    </TouchableOpacity>
  </View>
);

const handleConfirmationFlow = async () => {
  // You can call `show` with or without props, depending on the requirements of the modal.
  const result = await magicModal.show(ConfirmationModal);

  if (result.success) {
    return magicModal.show(() => <ResponseModal text="Success!" />);
  }

  return magicModal.show(() => <ResponseModal text="Failure :(" />);
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

Refer to the [example](example/src) for detailed usage scenarios.

## Documentation

Access the complete documentation [here](https://gstj.github.io/react-native-magic-modal/).

## FAQ

**Q:** Can I have two modals showing up at the same time?

**A:** No, we only allow one modal to be shown at a time. If you try to show a modal while another is already visible, the previous modal will be hidden.

## Contributors

Special thanks to everyone who contributed to making React Native Magic Modal a robust and user-friendly library. [See the full list](https://github.com/GSTJ/react-native-magic-modal/graphs/contributors).

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository.

## License

React Native Magic Modal is licensed under the [MIT License](LICENSE).
