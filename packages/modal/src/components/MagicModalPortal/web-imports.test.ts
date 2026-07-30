import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("web-compatible package imports", () => {
  it("keeps FullWindowOverlay behind a browser-specific boundary", () => {
    const overlaySource = readFileSync(
      join(
        process.cwd(),
        "src/components/MagicModalPortal/full-window-overlay.tsx",
      ),
      "utf8",
    );
    const browserOverlaySource = readFileSync(
      join(
        process.cwd(),
        "src/components/MagicModalPortal/full-window-overlay.browser.tsx",
      ),
      "utf8",
    );

    expect(overlaySource).toContain(
      'import * as ReactNativeScreens from "react-native-screens";',
    );
    expect(overlaySource).not.toContain("react-native-screens/src/");
    expect(browserOverlaySource).not.toContain('from "react-native-screens"');
  });

  it("declares web dependencies for both animated styles", () => {
    const modalSource = readFileSync(
      join(process.cwd(), "src/components/magic-modal.tsx"),
      "utf8",
    );

    expect(modalSource).toContain("}, [translationX, translationY]);");
    expect(modalSource).toContain(
      `}, [
      config.swipeDirection,
      isHorizontal,
      rangeMap,
      translationX,
      translationY,
    ]);`,
    );
  });

  it("does not leave Reanimated exit clones behind on web", () => {
    const modalSource = readFileSync(
      join(process.cwd(), "src/components/magic-modal.tsx"),
      "utf8",
    );

    expect(modalSource).toContain(
      'Platform.OS === "web" ? undefined : FadeOut',
    );
    expect(modalSource).toContain('isSwipeComplete || Platform.OS === "web"');
  });
});
