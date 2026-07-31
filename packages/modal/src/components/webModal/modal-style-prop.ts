import type { CSSProperties } from "react";

/**
 * `config.style` on the browser entry, and what to do with the old React Native
 * shape when someone passes it anyway.
 *
 * v10.1 changed this prop's type from `StyleProp<ViewStyle>` to
 * `React.CSSProperties`. The two overlap enough that most modals migrate by
 * changing nothing, and differ enough that the ones that do not would fail
 * silently: an array reaches the DOM as `style={["0", "1"]}` and a
 * `paddingHorizontal` is simply dropped, both without a word.
 *
 * TypeScript catches this at the call site. The check below is for the callers
 * TypeScript cannot see — untyped JavaScript, a config assembled from
 * `Record<string, unknown>`, a shared config object typed against the React
 * Native entry.
 */

/**
 * React Native style keys with no CSS equivalent of the same name. Not
 * exhaustive: enough of the common ones to name the problem when one appears.
 */
const REACT_NATIVE_ONLY_KEYS = [
  "elevation",
  "includeFontPadding",
  "marginHorizontal",
  "marginVertical",
  "paddingHorizontal",
  "paddingVertical",
  "resizeMode",
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  "textAlignVertical",
  "tintColor",
];

const MIGRATION_HINT = `[magic-modal] The web entry's \`style\` is React.CSSProperties as of v10.1, not a React Native style.

Pass one plain CSS object: no arrays, no StyleSheet handles, and CSS property names.
  paddingHorizontal: 16  ->  paddingInline: 16
  marginVertical: 8      ->  marginBlock: 8
  shadow* / elevation    ->  boxShadow
  [a, b]                 ->  { ...a, ...b }

React Native styles keep working on the React Native entry, which still types this as StyleProp<ViewStyle>.`;

/** Once per process: the same modal config usually renders many times. */
let hasWarned = false;

const looksLikeReactNativeStyle = (style: unknown) => {
  if (Array.isArray(style)) {
    return true;
  }

  if (typeof style !== "object" || style === null) {
    // A registered `StyleSheet.create` handle used to be a number.
    return typeof style === "number";
  }

  const record = style as Record<string, unknown>;

  return (
    Array.isArray(record.transform) ||
    REACT_NATIVE_ONLY_KEYS.some((key) => record[key] !== undefined)
  );
};

/**
 * Narrows `config.style` to what the DOM can take, and says so in development
 * when it had to drop something.
 *
 * An array is dropped rather than flattened. Flattening it would be guessing at
 * what the caller meant on a prop whose type says arrays are gone, and would
 * turn a loud break into a subtly wrong one.
 */
export const resolveModalStyle = (
  style: unknown,
): CSSProperties | undefined => {
  if (__DEV__ && !hasWarned && looksLikeReactNativeStyle(style)) {
    hasWarned = true;
    // eslint-disable-next-line no-console
    console.warn(MIGRATION_HINT);
  }

  if (typeof style !== "object" || style === null || Array.isArray(style)) {
    return undefined;
  }

  return style as CSSProperties;
};
