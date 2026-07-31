# Magic Modal registry

This directory is the source for a custom shadcn registry item. It copies a
React Native component into the consumer's project and adds
`react-native-magic-modal` as a dependency. It is separate from the official
shadcn registry directory.

The component renders the dialog surface. `MagicModalPortal` owns the backdrop,
stack, animation, and promise lifecycle. Mount the portal once in the app root:

```tsx
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MagicModalPortal } from "react-native-magic-modal";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
      <MagicModalPortal />
    </GestureHandlerRootView>
  );
}
```

Expo needs SDK-compatible native peers:

```bash
npx expo install react-native-gesture-handler react-native-reanimated react-native-worklets react-native-screens
```

The copied component includes a typed action result and a cancellation result:

```tsx
import { MagicModalHideReason } from "react-native-magic-modal";

import { showMagicModal } from "@/components/magic-modal";

const result = await showMagicModal({
  title: "Delete this project?",
  description: "This cannot be undone.",
  actions: [
    {
      label: "Delete",
      value: "delete" as const,
      variant: "destructive",
    },
  ],
});

if (result.reason === MagicModalHideReason.BACKDROP_PRESS) {
  // The user pressed outside the dialog.
}

if (result.reason === MagicModalHideReason.INTENTIONAL_HIDE && result.data.type === "action") {
  console.log(result.data.value);
}
```

The Cancel button returns `{ type: "cancel" }` through an intentional hide.
Android back, backdrop presses, and `hideAll()` keep the package's existing hide
reasons.

## Local checks

Run the schema validator, component typecheck, and static JSON build:

```bash
pnpm registry:check
```

Start the docs site to serve the generated item:

```bash
pnpm docs:dev
```

Preview the install from another project with a `components.json` file:

```bash
pnpm dlx shadcn@4.16.0 add http://localhost:3000/react-native-magic-modal/r/magic-modal.json --dry-run
```

Drop `--dry-run` to copy the component. The target comes from
`aliases.components` in that project's `components.json`.

Once these files are on the public default branch, the same source registry can
be addressed through GitHub:

```bash
pnpm dlx shadcn@4.16.0 add GSTJ/react-native-magic-modal/magic-modal
```

That command uses shadcn's public GitHub registry flow. It does not list this
project in shadcn's registry directory.
