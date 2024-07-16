# 🦄 Magic Modal Changelog 🪄

## 5.0.3 (2024-07-16)

## 5.0.2 (2024-06-20)

## 5.0.1 (2024-06-20)

## 5.0.0 (2024-06-14)


### ⚠ BREAKING CHANGES

* improve type safety and docs

### :stars: New Features :stars:

* improve type safety and docs ([d3a7884](https://github.com/GSTJ/react-native-magic-modal/commit/d3a78842b7da87436abd163dc8ac0735a7264e7c))

## 4.0.8 (2024-06-14)

## 4.0.7 (2024-06-09)

## 4.0.6 (2024-06-08)

## 4.0.5 (2024-06-08)


### :curly_loop: Continuous Integrations :curly_loop:

* revert release config ([f6fb9a9](https://github.com/GSTJ/react-native-magic-modal/commit/f6fb9a907d59f35136d3baa51ebb1f3cbc22b084))

## [4.0.0](https://github.com/GSTJ/react-native-magic-modal/compare/2.1.8...4.0.5) (2024-06-08)

### ⚠ BREAKING CHANGES

- support multiple modals (#81)

### :stars: New Features :stars:

- support multiple modals ([#81](https://github.com/GSTJ/react-native-magic-modal/issues/81)) ([70da143](https://github.com/GSTJ/react-native-magic-modal/commit/70da143bb546cbb57ede01c9aca6b0595f34e0d1))

### :curly_loop: Continuous Integrations :curly_loop:

- fix pr checks ([#79](https://github.com/GSTJ/react-native-magic-modal/issues/79)) ([38df15f](https://github.com/GSTJ/react-native-magic-modal/commit/38df15f4b469a570a8d7a480c127a09fe9254245))

## 2.1.8 (2024-06-07)

## 2.1.7 (2024-06-07)

### :curly_loop: Continuous Integrations :curly_loop:

- validate versions on kitchen-sink are expo-compatible ([021a933](https://github.com/GSTJ/react-native-magic-modal/commit/021a933e07d442c6cc3065b5fed986b61cd8941e))

## 2.1.6 (2024-06-07)

## 2.1.5 (2024-06-06)

## 2.1.4 (2024-06-06)

## 2.1.3 (2024-06-06)

## 2.1.2 (2024-06-06)

## 2.1.1 (2024-06-06)

## [2.1.0](https://github.com/GSTJ/react-native-magic-modal/compare/2.0.13...2.1.0) (2024-06-06)

### :stars: New Features :stars:

- add web support ([befa910](https://github.com/GSTJ/react-native-magic-modal/commit/befa9105ad2fb5d0e49a128491f12f32c5c755d1))

### :curly_loop: Continuous Integrations :curly_loop:

- fix turbo json ([5c50641](https://github.com/GSTJ/react-native-magic-modal/commit/5c506410afc76d1348e414235476db9fa157d950))

## 2.0.13 (2024-06-04)

## 2.0.12 (2024-06-04)

## 2.0.11 (2024-06-03)

## 2.0.10 (2024-06-03)

## 2.0.9 (2024-06-01)

## 2.0.8 (2024-06-01)

## 2.0.7 (2024-05-29)

## 2.0.6 (2024-05-28)

## 2.0.5 (2024-05-28)

## 2.0.4 (2024-05-26)

## 2.0.3 (2024-05-25)

## [2.0.0](https://github.com/GSTJ/react-native-magic-modal/compare/1.0.0...2.0.0) (2024-05-25)

### ⚠ BREAKING CHANGES

- To preserve compatibility, swipeDirection "top" and
  "bottom" properties have been renamed back to "up" and "down". It also
  makes more sense overall.

### :stars: New Features :stars:

- rename swipeDirection "top" and "bottom" to "up" and "down" ([#52](https://github.com/GSTJ/react-native-magic-modal/issues/52)) ([c6107ff](https://github.com/GSTJ/react-native-magic-modal/commit/c6107ff49e197eba852cfa0cc0b23d6f2106b1e6))

### :curly_loop: Continuous Integrations :curly_loop:

- force docs gen ([633cf09](https://github.com/GSTJ/react-native-magic-modal/commit/633cf09da9c14d52f318315300d6014016312dfc))
- normalize repository settings ([4a827c5](https://github.com/GSTJ/react-native-magic-modal/commit/4a827c5ffd43c88da278fe81424df96c009ec3f6))

## 1.0.0 (2024-05-25)

### ⚠ BREAKING CHANGES

- Renames "direction" to "swipeDirection"

### :hammer: Bug Fixes :hammer:

- make modals appear on top of react-native modals & add new animation props ([#51](https://github.com/GSTJ/react-native-magic-modal/issues/51)) ([0cbca82](https://github.com/GSTJ/react-native-magic-modal/commit/0cbca82ca8033772d4bb996d26e7b1af7da7d76d))

## 0.3.3 (2024-05-24)

### Bug Fixes

- fix bugs and improve performance ([#40](https://github.com/GSTJ/react-native-magic-modal/issues/40)) ([2694e60](https://github.com/GSTJ/react-native-magic-modal/commit/2694e60291a4ede152168601d7c962b910885c43))

## 0.3.x (2024-04-24)

### Breaking Change

The component has been fully restructured not to depend on react-native-modal and have full control, using react-native-reanimated. Some properties are not available anymore, please refer to the docs for a full list of supported properties.

If you happened to use the library for an use-case not supported anymore, with no equivalent properties, please open an issue.
