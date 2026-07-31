# react-native-magic-modal

This package is now called [`magic-modal`](https://www.npmjs.com/package/magic-modal).

Nothing here has stopped working. `react-native-magic-modal` depends on `magic-modal` and
re-exports it, published from the same commit at the same version. Installing either name gets you
the same code and the same updates.

```bash
pnpm add magic-modal
```

```tsx
import { MagicModalPortal, magicModal, useMagicModal } from "magic-modal";
```

## Moving over

Swap the dependency and the import specifier. The exported API is identical — same functions, same
types, same names — so there is nothing else to change.

```diff
-import { magicModal } from "react-native-magic-modal";
+import { magicModal } from "magic-modal";
```

## If you stay

You will see a deprecation notice on install. That is the only difference. This package will keep
tracking releases so existing projects are not forced to move on anyone else's schedule.

## Why the rename

Magic Modal runs on the web, in Next.js, and in React Native from the same API. The old name only
described one of those.

Documentation and source live at [GSTJ/magic-modal](https://github.com/GSTJ/magic-modal).
Full docs: <https://magic-modal.gabrieltaveira.dev/>.

## License

MIT
