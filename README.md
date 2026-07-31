# Evidence branch

Screen recordings and extracted frames for #329 and #334, parked here only so
the PR comments have something to link to. There is no source on this branch and
nothing to review. **Never merge it.** Delete it once both PRs are closed.

| File | PR | Recorded from |
| --- | --- | --- |
| `videos/pr329-fwo-ios.mp4` | #329 | `fix/fwo-lazy-mount` @ `ed18845` |
| `videos/pr334-native-sanity-ios.mp4` | #334 | `feat/web-light-bundle` @ `df04f15` |
| `videos/pr334-web.mp4` | #334 | `feat/web-light-bundle` @ `df04f15` |

The two iOS videos are `xcrun simctl io recordVideo` on a booted iPhone 17 Pro
(iOS 26.5) running the kitchen-sink example built Release, driven by Maestro
2.7.0. The web video is Playwright against Chrome, on a production `next build`
of `examples/next-web`, with pointer input dispatched through CDP.

Both iOS videos are downscaled to 480px wide, and the app-launch head is
trimmed off the front (13.6s from the #329 file, 11.5s from the #334 one).
Nothing else is edited: no cuts, no speed changes.

`frames/` holds stills pulled out of those same three files.
