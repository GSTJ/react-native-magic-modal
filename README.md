# Evidence branch

Screen recordings and extracted frames for #329, #334 and #336, parked here only
so the PR comments have something to link to. There is no source on this branch
and nothing to review. **Never merge it.** Delete it once the PRs are closed.

| File | PR | Recorded from |
| --- | --- | --- |
| `videos/pr329-fwo-ios.mp4` | #329 | `fix/fwo-lazy-mount` @ `ed18845` |
| `videos/pr334-native-sanity-ios.mp4` | #334 | `feat/web-light-bundle` @ `df04f15` |
| `videos/pr334-web.mp4` | #334 | `feat/web-light-bundle` @ `df04f15` |
| `videos/pr336-native-sanity-ios.mp4` | #336 | `feat/web-dom-native` @ `14a24f5` |
| `videos/pr336-web.mp4` | #336 | `feat/web-dom-native` @ `14a24f5` |

The iOS videos are `xcrun simctl io recordVideo` on a booted iPhone 17 Pro
(iOS 26.5) running the kitchen-sink example built Release, driven by Maestro
2.7.0. The web videos are Playwright against Chrome, on a production
`next build` of `examples/next-web`, with pointer input dispatched through CDP.

The iOS videos are downscaled and the app-launch head is trimmed off the front
(13.6s from the #329 file, 11.5s from the #334 one, 9.3s from the #336 one).
No cuts, no speed changes.

The #336 web video carries three things the page does not normally have, all of
them disclosed in the PR comment: a cursor dot and a caption pill, both additive
overlays with `pointer-events: none`, and a CDP `Animation.setPlaybackRate` of
0.3 so the 250ms animations are readable at 25fps. The library's own timings are
untouched — the recording only scales the page's animation timelines.

`frames/` holds stills pulled out of those same files.
