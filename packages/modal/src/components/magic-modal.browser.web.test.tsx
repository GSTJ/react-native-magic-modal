import type { HideReturn } from "../constants/types";

import React, { act } from "react";
import { createRoot } from "react-dom/client";

import { MagicModalHideReason } from "../constants/types";
import { magicModal } from "../utils/magic-modal-handler";
import { MagicModalPortal } from "./MagicModalPortal/magic-modal-portal.browser";

/**
 * The browser chrome, rendered in jsdom with `react-native` aliased to
 * react-native-web — the substitution every web app makes.
 *
 * jsdom has no Web Animations API, so `Element.animate` is faked here with an
 * animation whose `finished` promise this suite resolves by hand. That is the
 * only way to hold an exit open long enough to assert on it: without it the
 * chrome's fallback lands on the final keyframe and the entry unmounts in the
 * same microtask. What a fake cannot show is timing or feel — that needs
 * `examples/next-web/tools/browser-smoke.mjs`.
 */

// `act` deadlocks without this: React never installs the queue it drains.
// @testing-library/react sets it for you, and this package does not depend on
// it — the React Native suites go through @testing-library/react-native, which
// cannot render a DOM.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type FakeAnimation = {
  cancel: jest.Mock;
  finish: () => void;
  finished: Promise<void>;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};

let animations: FakeAnimation[] = [];

const fakeAnimate = jest.fn(
  (keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    let finish = () => {};
    const finished = new Promise<void>((resolve) => {
      finish = () => {
        resolve();
      };
    });

    const animation = {
      cancel: jest.fn(),
      finish,
      finished,
      keyframes,
      options,
    } satisfies FakeAnimation;

    animations.push(animation);

    return animation as unknown as Animation;
  },
);

const finishAllAnimations = async () => {
  await act(async () => {
    for (const animation of animations) {
      animation.finish();
    }
  });
};

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;

const query = (selector: string) => document.querySelectorAll(selector);

const stackEntries = () =>
  query('[data-testid="magic-modal-stack-entry"]').length;

const dialog = () => document.querySelector('[role="dialog"]');

const render = async () => {
  await act(async () => {
    root.render(<MagicModalPortal />);
  });
};

const ModalContent = () => (
  <button data-testid="modal-button" type="button">
    Close
  </button>
);

/**
 * The handle comes back wrapped in an object on purpose. `magicModal.show`
 * returns a promise that only settles when the modal closes, and returning it
 * from an `async` helper would make the helper adopt it — `await show()` would
 * then hang until something dismissed the modal.
 */
const show = async (config?: Parameters<typeof magicModal.show>[1]) => {
  let handle: Promise<HideReturn<unknown>> | undefined;

  await act(async () => {
    handle = magicModal.show(ModalContent, config);
  });

  return { hidden: handle as Promise<HideReturn<unknown>> };
};

const viewport = { height: 768, width: 1024 };

beforeAll(() => {
  // jsdom does not implement the Web Animations API at all.
  Element.prototype.animate = fakeAnimate;

  // jsdom lays nothing out, so `document.documentElement` measures 0x0 and
  // react-native-web's `useWindowDimensions` reports a zero-sized window. The
  // swipe reads it to work out how far off screen is, so give it a viewport.
  Object.defineProperty(document.documentElement, "clientHeight", {
    value: viewport.height,
  });
  Object.defineProperty(document.documentElement, "clientWidth", {
    value: viewport.width,
  });
});

beforeEach(() => {
  animations = [];
  fakeAnimate.mockClear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

describe("browser chrome", () => {
  it("puts a labelled dialog in the document", async () => {
    await render();
    await show({ accessibilityLabel: "Confirm" });

    expect(dialog()?.getAttribute("aria-label")).toBe("Confirm");
    expect(dialog()?.getAttribute("aria-modal")).toBe("true");
    expect(stackEntries()).toBe(1);
  });

  it("plays an entrance built from the direction and the configured timing", async () => {
    await render();
    await show({ animationInTiming: 400, swipeDirection: "up" });

    const [backdrop, content] = animations;

    expect(backdrop?.options.duration).toBe(400);
    expect(backdrop?.keyframes).toStrictEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(content?.keyframes[0]?.transform).toBe("translate3d(0px, -25px, 0)");
  });

  it("keeps the entry mounted until its exit finishes", async () => {
    await render();
    const { hidden } = await show({ animationOutTiming: 300 });

    animations = [];

    await act(async () => {
      magicModal.hideAll();
    });

    // Dismissed, resolved, and still on screen: the exit needs something to
    // play on.
    await expect(hidden).resolves.toStrictEqual({
      reason: MagicModalHideReason.GLOBAL_HIDE_ALL,
    });
    expect(stackEntries()).toBe(1);
    expect(animations.map(({ options }) => options.duration)).toStrictEqual([
      300, 300,
    ]);
    expect(animations[1]?.keyframes.at(-1)?.transform).toBe(
      "translate3d(0px, 25px, 0)",
    );

    await finishAllAnimations();

    expect(stackEntries()).toBe(0);
  });

  it("hands the dialog role down the stack the moment the top is dismissed", async () => {
    await render();
    await show({ accessibilityLabel: "First" });
    await show({ accessibilityLabel: "Second" });

    expect(stackEntries()).toBe(2);
    expect(dialog()?.getAttribute("aria-label")).toBe("Second");

    await act(async () => {
      magicModal.hide(undefined);
    });

    // The leaving entry is still mounted, but it is out of the accessibility
    // tree and the one underneath is the dialog again.
    expect(stackEntries()).toBe(2);
    expect(query('[role="dialog"]')).toHaveLength(1);
    expect(dialog()?.getAttribute("aria-label")).toBe("First");

    await finishAllAnimations();

    expect(stackEntries()).toBe(1);
  });

  it("dismisses on Escape and restores focus to the opener", async () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();

    await render();
    const { hidden } = await show();

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });

    await expect(hidden).resolves.toStrictEqual({
      reason: MagicModalHideReason.BACK_BUTTON_PRESS,
    });

    await finishAllAnimations();
    await act(async () => {
      // Focus is restored on the next frame, which is when React has settled.
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
    });

    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it("lets a back-button handler keep the modal open", async () => {
    await render();
    await show({ onBackButtonPress: () => {} });

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });

    expect(query('[role="dialog"]')).toHaveLength(1);
  });

  it("skips the entrance animation when there is no Web Animations API", async () => {
    const animate = Element.prototype.animate;
    // @ts-expect-error -- reproducing a browser without WAAPI.
    Element.prototype.animate = undefined;

    try {
      await render();
      const { hidden } = await show();

      await act(async () => {
        magicModal.hideAll();
      });
      await act(async () => {});

      await expect(hidden).resolves.toStrictEqual({
        reason: MagicModalHideReason.GLOBAL_HIDE_ALL,
      });
      // Nothing to wait for, so the entry leaves as soon as React can drop it.
      expect(stackEntries()).toBe(0);
    } finally {
      Element.prototype.animate = animate;
    }
  });
});

describe("swipe-to-dismiss", () => {
  const firePointer = (
    node: Element,
    type: string,
    { time, x, y }: { time: number; x: number; y: number },
  ) => {
    const event = new MouseEvent(type, {
      bubbles: true,
      button: 0,
      cancelable: true,
      clientX: x,
      clientY: y,
    });

    Object.defineProperty(event, "pointerId", { value: 1 });
    Object.defineProperty(event, "timeStamp", { value: time });
    node.dispatchEvent(event);
  };

  const flick = async (
    node: Element,
    { time, y }: { time: number; y: number },
  ) => {
    await act(async () => {
      firePointer(node, "pointerdown", { time: 0, x: 100, y: 100 });
      firePointer(node, "pointermove", {
        time: time / 2,
        x: 100,
        y: 100 + y / 2,
      });
      firePointer(node, "pointermove", { time, x: 100, y: 100 + y });
      firePointer(node, "pointerup", { time, x: 100, y: 100 + y });
    });
  };

  it("claims only the axis it dismisses on", async () => {
    await render();
    await show({ swipeDirection: "left" });

    expect((dialog() as HTMLElement | null)?.style.touchAction).toBe("pan-y");
  });

  it("leaves the browser alone when the swipe is disabled", async () => {
    await render();
    await show({ swipeDirection: undefined });

    // jsdom has no `touch-action` in its CSS model, so an untouched property
    // reads back as undefined rather than the empty string a browser gives.
    expect((dialog() as HTMLElement | null)?.style.touchAction).toBeFalsy();

    await flick(dialog()!, { time: 100, y: 300 });

    expect(query('[role="dialog"]')).toHaveLength(1);
  });

  it("tracks the drag on the motion layer and the backdrop", async () => {
    await render();
    await show({ swipeDirection: "down" });

    await act(async () => {
      firePointer(dialog()!, "pointerdown", { time: 0, x: 100, y: 100 });
      firePointer(dialog()!, "pointermove", { time: 200, x: 100, y: 400 });
    });

    const motion = document.querySelector<HTMLElement>(
      '[data-testid="magic-modal-motion-layer"]',
    );
    const backdrop = document.querySelector<HTMLElement>(
      '[data-testid="magic-modal-backdrop"]',
    );

    expect(motion?.style.transform).toBe("translate3d(0px, 300px, 0)");
    // The backdrop clears in step with the drag: 300px of a 768px screen.
    expect(Number(backdrop?.style.opacity)).toBeCloseTo(
      1 - 300 / viewport.height,
      3,
    );
  });

  it("dismisses a fast flick with SWIPE_COMPLETE", async () => {
    await render();
    const { hidden } = await show({ swipeDirection: "down" });

    // 300px in 100ms is 3000px/s, well past the 500px/s threshold.
    await flick(dialog()!, { time: 100, y: 300 });
    await finishAllAnimations();

    await expect(hidden).resolves.toStrictEqual({
      reason: MagicModalHideReason.SWIPE_COMPLETE,
    });
  });

  it("springs a slow drag back instead of dismissing it", async () => {
    await render();
    await show({ swipeDirection: "down" });

    // 300px over two seconds: 150px/s, under the threshold.
    await flick(dialog()!, { time: 2000, y: 300 });
    await finishAllAnimations();

    expect(query('[role="dialog"]')).toHaveLength(1);

    const motion = document.querySelector<HTMLElement>(
      '[data-testid="magic-modal-motion-layer"]',
    );

    expect(motion?.style.transform).toBe("translate3d(0px, 0px, 0)");
  });

  it("swallows the click a completed drag ends on", async () => {
    await render();
    await show({ swipeDirection: "down" });

    const onClick = jest.fn();
    const button = document.querySelector<HTMLElement>(
      '[data-testid="modal-button"]',
    );
    button?.addEventListener("click", onClick);

    await flick(dialog()!, { time: 2000, y: 300 });

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClick).not.toHaveBeenCalled();

    // Only the one click, so an ordinary press right after still lands.
    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
