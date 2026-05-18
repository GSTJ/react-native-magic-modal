# Maestro E2E Flows — kitchen-sink

End-to-end smoke tests for the `react-native-magic-modal` kitchen-sink example
app, executed with [Maestro](https://maestro.mobile.dev).

## Flows

### Run on CI (`.github/workflows/e2e-ios.yml`)

| File | Purpose |
| ---- | ------- |
| `smoke-launch.yaml` | App boots and the home screen renders the primary buttons. |
| `smoke-modal-open-close.yaml` | The primary "Show Modal" example opens `ExampleModal` and can be dismissed via the in-modal **Close Modal** button. |

These flows only touch UI surfaces that exist on the `renovate-sweep` /
`main` branches and should be stable across SDK upgrades.

### Present but NOT in the CI matrix

| File | Why it is skipped |
| ---- | ----- |
| `crash-test-dropdown.yaml` | References `app/crash-test.tsx` ("Android Crash Test (Pure Reproduction)") which only exists on the issue-155 fix branch. |
| `issue155-crash-test.yaml` | References `app/issue155.tsx` ("Test Issue #155 (Navigation Crash)") which only exists on the issue-155 fix branch. |
| `stress-test-crash.yaml` | Same as above — depends on the crash-test screen. |

Once the issue-155 fix branch is merged (which adds the `crash-test` and
`issue155` route files), add these flows to the `e2e-ios.yml` matrix.

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
