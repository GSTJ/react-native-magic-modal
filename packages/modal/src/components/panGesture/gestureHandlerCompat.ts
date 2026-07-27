import type {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
// A namespace import is the only way to read an export that might not be there.
// `import { usePanGesture }` is a hard error on gesture-handler 2.x, both when
// typechecking and, under a real ESM loader, at runtime.
import * as GestureHandler from "react-native-gesture-handler";

type GestureHandlerModule = typeof GestureHandler;

/**
 * Stands in for gesture-handler 3.x's `PanGestureConfig` when the installed
 * gesture-handler is 2.x and the real type does not exist. It only lists what
 * `MagicModal` reads or writes.
 *
 * On 3.x, `PanGestureConfigCompat` below resolves to the type the installed
 * `usePanGesture` actually accepts, so a rename upstream breaks `tsc` instead
 * of the app.
 */
interface FallbackPanGestureConfig {
  enabled?: boolean;
  minDistance?: number;
  onBegin?: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => void;
  onActivate?: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => void;
  onUpdate?:
    | ((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => void)
    // 3.x's `onUpdate` also takes an `Animated.event` object, which is not
    // callable. Kept in the union so anything reading `onUpdate` has to narrow
    // it the same way on both majors.
    | AnimatedEventStandIn;
  onDeactivate?: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => void;
  onFinalize?: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => void;
}

interface AnimatedEventStandIn {
  _argMapping: unknown[];
}

/** gesture-handler 3.x's `PanGestureConfig`, or the fallback above on 2.x. */
export type PanGestureConfigCompat = GestureHandlerModule extends {
  usePanGesture: (config?: infer Config) => unknown;
}
  ? NonNullable<Config>
  : FallbackPanGestureConfig;

/**
 * gesture-handler 3.x's `PanGesture`, or `never` on 2.x. `never` is assignable
 * to 2.x's `GestureDetector["gesture"]`, so the hook-based surface still
 * typechecks against a major that can never render it.
 */
type PanGestureCompat = GestureHandlerModule extends {
  usePanGesture: (...args: never[]) => infer Gesture;
}
  ? Gesture
  : never;

type UsePanGesture = (config: PanGestureConfigCompat) => PanGestureCompat;

/**
 * Plain assignment rather than a cast: on 3.x this only compiles if the real
 * hook matches the signature above, and on 2.x the property is simply absent.
 *
 * `GestureDetector` is only here as an anchor. A target whose every property is
 * optional is a weak type, and TypeScript rejects assignments to weak types that
 * share no properties with the source, which is exactly the 2.x case.
 */
const gestureHandler: Pick<GestureHandlerModule, "GestureDetector"> & {
  usePanGesture?: UsePanGesture;
} = GestureHandler;

/**
 * True on gesture-handler 3.x. `usePanGesture` is exported from the package
 * root there (`src/index.ts` re-exports `./v3`) and does not exist in 2.x.
 *
 * Read once, at module scope. The installed gesture-handler cannot change
 * during a process lifetime, so anything downstream can treat this as a
 * constant, which is what keeps hook order stable.
 */
export const hasPanGestureHook =
  typeof gestureHandler.usePanGesture === "function";

const missingPanGestureHook = (): never => {
  throw new Error(
    "react-native-magic-modal called usePanGesture, which requires react-native-gesture-handler 3.x. This is a bug: the hook-based swipe surface should only render when hasPanGestureHook is true.",
  );
};

export const usePanGestureCompat: UsePanGesture =
  gestureHandler.usePanGesture ?? missingPanGestureHook;
