# Maestro E2E Flows — kitchen-sink

End-to-end smoke tests for the `react-native-magic-modal` kitchen-sink example
app, executed with [Maestro](https://maestro.mobile.dev).

## Flows

### Run on CI (`.github/workflows/e2e-ios.yml`)

| File                          | Purpose                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `smoke-launch.yaml`           | App boots and the home screen renders the primary buttons.                                                          |
| `smoke-modal-open-close.yaml` | The primary "Show Modal" example opens `ExampleModal` and can be dismissed via the in-modal **Close Modal** button. |

These flows only touch UI surfaces that exist on the `renovate-sweep` /
`main` branches and should be stable across SDK upgrades.

### Present but NOT in the CI matrix

| File                       | Why it is skipped                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `crash-test-dropdown.yaml` | References `app/crash-test.tsx` ("Android Crash Test (Pure Reproduction)") which only exists on the issue-155 fix branch. |
| `issue155-crash-test.yaml` | References `app/issue155.tsx` ("Test Issue #155 (Navigation Crash)") which only exists on the issue-155 fix branch.       |
| `stress-test-crash.yaml`   | Same as above — depends on the crash-test screen.                                                                         |
| `swipe-dismiss-up.yaml`    | Asserts on text. XCUITest can't see into the RN tree on this stack, see below.                                            |
| `swipe-dismiss-down.yaml`  | Same.                                                                                                                     |
| `swipe-dismiss-left.yaml`  | Same.                                                                                                                     |
| `swipe-dismiss-right.yaml` | Same.                                                                                                                     |

Once the issue-155 fix branch is merged (which adds the `crash-test` and
`issue155` route files), add those two flows to the `e2e-ios.yml` matrix.

## The swipe flows

The four `swipe-dismiss-*.yaml` flows drive the `Swipe To Dismiss` screen
(`src/app/swipe.tsx`) instead of the home screen's "Show Modal", which
randomizes its direction and closes itself on a timer. Each one opens a modal
pinned to one direction, flicks it off screen, and asserts on the hide reason
the screen renders for that direction. A backdrop tap or a stray `hide()`
empties the screen just the same, so the reason is what separates a completed
swipe from everything else.

They don't run yet. On iOS 26 + RN 0.83, XCUITest reports the entire React
Native root as a single opaque accessibility element with no children, so no
text and no `testID` in the app is reachable. `maestro hierarchy` on the home
screen returns one node at `[0,0][402,874]`. That's the same wall that reduced
`smoke-launch.yaml` and `smoke-modal-open-close.yaml` to launch-plus-screenshot,
and it applies to buttons that predate these flows: `assertVisible: "Show
Modal"` fails too.

The swipe coordinates are tuned and verified, so the flows should pass as
written once the accessibility tree comes back. Each direction was confirmed by
hand on an iPhone 17 Pro simulator (402x874 pt) by driving the same taps and
swipes through coordinates and reading the rendered hide reason. The horizontal
pair travels 70% of the screen width; 40% came out under
`swipeVelocityThreshold` once Maestro's interpolation decelerated.

Run one by hand:

```sh
maestro test examples/kitchen-sink/.maestro/swipe-dismiss-up.yaml
```

## Run locally

Prereqs:

- macOS with Xcode + an iOS simulator booted.
- The kitchen-sink app installed on the simulator:
  ```sh
  cd examples/kitchen-sink
  pnpm expo prebuild --platform ios --clean
  pnpm expo run:ios
  ```
- Maestro CLI: <https://maestro.mobile.dev/getting-started/installing-maestro>.

Run a single flow:

```sh
maestro test examples/kitchen-sink/.maestro/smoke-launch.yaml
```

Run the CI smoke set:

```sh
maestro test \
  examples/kitchen-sink/.maestro/smoke-launch.yaml \
  examples/kitchen-sink/.maestro/smoke-modal-open-close.yaml
```

The app id (`com.gstj.reactnativemagicmodalexample`) is declared in
`examples/kitchen-sink/app.config.ts` and matches the `appId` in each flow.
