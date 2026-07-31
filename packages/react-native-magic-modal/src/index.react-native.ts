// Byte-for-byte the same re-export as index.ts, and that is the point.
//
// What makes the two entries different is not their contents but which file the
// consumer's resolver picks, and what that resolver then does with the
// `magic-modal` specifier inside it. Metro reads this package's `react-native`
// field and its `react-native` export condition, lands here, and resolves
// `magic-modal` with the same condition — reaching magic-modal's React Native
// entry. A web bundler lands in index.ts and resolves `magic-modal` without it,
// reaching the SSR-safe entry that omits react-native-screens.
//
// Collapsing these into one file would work today, because both delegate. It
// would also mean this package's export map no longer has the same shape as
// magic-modal's, and a resolver that keys off `react-native` would find nothing
// where it expects a file. Keeping both is free.
export * from "magic-modal";
