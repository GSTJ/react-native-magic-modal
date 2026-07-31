// The whole package. `magic-modal` is a runtime dependency, so bunchee leaves
// this specifier alone and the built file is a one-line re-export.
//
// This is deliberately `export *` rather than a hand-written list of names. A
// list would have to be updated every time `magic-modal` grows an export, and
// nothing would fail if it wasn't — the alias would just quietly stop being an
// alias. `export *` carries values and types alike, and there is no default
// export to miss.
//
// Condition splitting is not re-implemented here. This file and
// `index.react-native.ts` are identical on purpose: each one resolves
// `magic-modal` under whatever conditions the consumer's bundler is already
// using, so the web entry reaches magic-modal's web entry and the React Native
// entry reaches its React Native entry. See index.react-native.ts.
export * from "magic-modal";
