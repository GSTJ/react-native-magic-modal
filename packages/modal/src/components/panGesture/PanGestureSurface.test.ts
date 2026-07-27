/**
 * `PanGestureSurface` resolves once, when this module first loads, from whether
 * the installed gesture-handler exports `usePanGesture`. That has to happen at
 * module scope: a branch inside a component would mean calling the hook
 * conditionally, and React would see the hook order change.
 *
 * The two swipe suites each pin a surface through their own mock so they cover
 * both wirings on any installed major, which leaves the detection itself
 * uncovered. This is where it's covered. Each case reloads the module graph in a
 * fresh registry, because the constant is read exactly once per process.
 */

interface IsolatedModules {
  picked: unknown;
  v2: unknown;
  v3: unknown;
  hasPanGestureHook: boolean;
}

/**
 * The surfaces have to come out of the same registry as `PanGestureSurface`
 * itself, otherwise the identity comparison is meaningless: every reload
 * produces fresh function objects.
 */
const load = <T>(modulePath: string): T => require(modulePath) as T;

const loadWith = (gestureHandlerOverrides: Record<string, unknown>) => {
  let loaded: IsolatedModules | undefined;

  jest.isolateModules(() => {
    jest.doMock("react-native-gesture-handler", () => ({
      ...jest.requireActual<Record<string, unknown>>(
        "react-native-gesture-handler",
      ),
      ...gestureHandlerOverrides,
    }));

    const { PanGestureSurface } = load<{ PanGestureSurface: unknown }>(
      "./index",
    );
    const { PanGestureSurfaceV2 } = load<{ PanGestureSurfaceV2: unknown }>(
      "./PanGestureSurface.v2",
    );
    const { PanGestureSurfaceV3 } = load<{ PanGestureSurfaceV3: unknown }>(
      "./PanGestureSurface.v3",
    );
    const { hasPanGestureHook } = load<{ hasPanGestureHook: boolean }>(
      "./gestureHandlerCompat",
    );

    loaded = {
      picked: PanGestureSurface,
      v2: PanGestureSurfaceV2,
      v3: PanGestureSurfaceV3,
      hasPanGestureHook,
    };
  });

  if (!loaded) {
    throw new Error("isolateModules never ran");
  }

  return loaded;
};

describe("PanGestureSurface", () => {
  it("picks the hook surface when gesture-handler exports usePanGesture", () => {
    const { picked, v3, hasPanGestureHook } = loadWith({
      usePanGesture: () => ({ handlerTag: -1 }),
    });

    expect(hasPanGestureHook).toBe(true);
    expect(picked).toBe(v3);
  });

  it("falls back to the builder surface when it doesn't", () => {
    // What a gesture-handler 2.x install looks like: no `usePanGesture` at the
    // package root at all.
    const { picked, v2, hasPanGestureHook } = loadWith({
      usePanGesture: undefined,
    });

    expect(hasPanGestureHook).toBe(false);
    expect(picked).toBe(v2);
  });
});
