import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("web-compatible package imports", () => {
  it("loads FullWindowOverlay through the public react-native-screens entry", () => {
    const portalSource = readFileSync(
      join(
        process.cwd(),
        "src/components/MagicModalPortal/magic-modal-portal.tsx",
      ),
      "utf8",
    );

    expect(portalSource).toContain(
      'import * as ReactNativeScreens from "react-native-screens";',
    );
    expect(portalSource).not.toContain("react-native-screens/src/");
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
