![React Native Magic Modal Cover](https://user-images.githubusercontent.com/50031755/182908700-6b94a470-0e5c-4af2-acba-b20acaffa0b8.png)

_A modal library that can be called imperatively from anywhere!_

## React Native Magic Modal 🦄

Do you find using modals in React Native to be a bit of a pain? Trying to keep control of its open state and repeating the code everywhere you want to use it can be pretty tedious.

And the problem only gets worse when you try to create complex flows, where one modal opens another with conditionals in place. Once you get past two modals, your main component is a mess, and the state is all over the place.

This library thoughtfully encapsulates complex concepts to provide a smooth experience when using React modals, inside or outside components (In [Sagas](https://redux-saga.js.org/), for example!)

Take a look to a in-depth explanation of its concepts on its [Medium article](https://medium.com/@gabrieltaveira/you-have-been-using-react-native-modals-wrong-9b8c17de2f96).

## 📸 Examples

| IOS                                                                                                                           | Android                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://user-images.githubusercontent.com/50031755/155215573-df8f20fb-9b3f-4ce6-9d48-2afa8cb41daa.gif" height=600/> | <img src="https://user-images.githubusercontent.com/50031755/155215547-d2b45f33-264e-4c90-8ff1-e33b72e2c3b1.gif" height=600/> |

## 🛠 Installation

```sh
yarn add react-native-magic-modal
```

## ⚙️ Usage

First, insert a `MagicModalPortal` in the top of the application.

```js
import { MagicModalPortal } from 'react-native-magic-modal';

export default function App() {
  return (
    <SomeRandomProvider>
      <MagicModalPortal />  // <-- On the top of the app component hierarchy
      <Router /> // Your app router or something could follow below
    </SomeRandomProvider>
  );
}
```

Then, you are free to use the `magicModal` as shown from anywhere you want.

```js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MagicModalPortal, magicModal } from 'react-native-magic-modal';

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
  // We can call it with or without props, depending on the requirements of the modal.
  const result = await magicModal.show(ConfirmationModal);

  if (result.success) {
    return magicModal.show(() => <ResponseModal text="Success!" />);
  }

  return magicModal.show(() => <ResponseModal text="Failure :(" />);
};

export const MainScreen = () => {
  return (
    <View>
      <TouchableOpacity onPress={handleConfirmationFlow}>
        <Text>Start the modal flow!</Text>
      </TouchableOpacity>
      <MagicModalPortal />
    </View>
  );
};
```

See [example](example/src) to see it in practice.

## 📖 Documentation

The docs are located [here](https://gstj.github.io/react-native-magic-modal/) in the project's [Github Pages](https://gstj.github.io/react-native-magic-modal/)

## 👨‍🏫 Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## ⚖️ License

[MIT](LICENSE)
