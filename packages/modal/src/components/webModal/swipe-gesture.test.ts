import type { Direction } from "../../constants/types";

import { TOUCH_SLOP } from "../../constants/gestures";
import {
  beginSwipeDrag,
  endSwipeDrag,
  getSwipeRange,
  getSwipeTouchAction,
  getSwipeVelocity,
  updateSwipeDrag,
} from "./swipe-gesture";

/**
 * The browser swipe rules, checked against the ones the Reanimated worklets in
 * `magic-modal.tsx` apply. The two implementations share no code — one runs on
 * gesture-handler, the other on Pointer Events — so this suite is what keeps
 * them from drifting.
 */

const directions = ["up", "down", "left", "right"] as const;

const dragConfig = {
  dampingFactor: 0.2,
  minDistance: TOUCH_SLOP,
};

const origin = { x: 100, y: 100 };

const drag = ({
  direction,
  from = origin,
  path,
}: {
  direction: Direction;
  from?: { x: number; y: number };
  path: { x: number; y: number; time: number }[];
}) =>
  path.reduce(
    (state, { time, ...point }) =>
      updateSwipeDrag(state, { ...dragConfig, direction, point, time }),
    beginSwipeDrag({ point: from, previous: { x: 0, y: 0 }, time: 0 }),
  );

describe("swipe activation", () => {
  it("stays inert until the pointer clears the touch slop", () => {
    const state = drag({
      direction: "down",
      path: [{ x: 100, y: 100 + TOUCH_SLOP - 1, time: 16 }],
    });

    expect(state.isActive).toBe(false);
    expect(state.translation).toStrictEqual({ x: 0, y: 0 });
  });

  it("activates on the diagonal distance, not one axis", () => {
    // Neither axis alone clears 10px; together they travel ~11.3px.
    const state = drag({
      direction: "down",
      path: [{ x: 108, y: 108, time: 16 }],
    });

    expect(state.isActive).toBe(true);
  });

  it("stays active once it has activated, even back near the origin", () => {
    const state = drag({
      direction: "down",
      path: [
        { x: 100, y: 160, time: 16 },
        { x: 100, y: 101, time: 32 },
      ],
    });

    expect(state.isActive).toBe(true);
  });
});

describe("swipe translation", () => {
  it.each(directions)(
    "follows the finger one-to-one towards %s",
    (direction) => {
      const travel = 60;
      const point = {
        up: { x: 100, y: 40 },
        down: { x: 100, y: 160 },
        left: { x: 40, y: 100 },
        right: { x: 160, y: 100 },
      }[direction];

      const state = drag({ direction, path: [{ ...point, time: 16 }] });
      const moved =
        direction === "up" || direction === "left" ? -travel : travel;

      expect(state.translation).toStrictEqual(
        direction === "left" || direction === "right"
          ? { x: moved, y: 0 }
          : { x: 0, y: moved },
      );
    },
  );

  it.each(directions)("damps travel against the %s dismissal", (direction) => {
    const point = {
      up: { x: 100, y: 200 },
      down: { x: 100, y: 0 },
      left: { x: 200, y: 100 },
      right: { x: 0, y: 100 },
    }[direction];

    const state = drag({ direction, path: [{ ...point, time: 16 }] });
    const onAxis =
      direction === "left" || direction === "right"
        ? state.translation.x
        : state.translation.y;

    // 100px of resisted travel at the default damping factor.
    expect(Math.abs(onAxis)).toBeCloseTo(20);
  });

  it("leaves the cross axis alone", () => {
    const state = drag({
      direction: "down",
      path: [{ x: 400, y: 200, time: 16 }],
    });

    expect(state.translation.x).toBe(0);
  });

  it("accumulates onto where the previous drag left the modal", () => {
    const state = updateSwipeDrag(
      beginSwipeDrag({
        point: origin,
        previous: { x: 0, y: 30 },
        time: 0,
      }),
      { ...dragConfig, direction: "down", point: { x: 100, y: 150 }, time: 16 },
    );

    expect(state.translation).toStrictEqual({ x: 0, y: 80 });
  });
});

describe("release velocity", () => {
  it("reports pixels per second across the sample window", () => {
    expect(
      getSwipeVelocity([
        { x: 0, y: 0, time: 0 },
        { x: 30, y: 60, time: 100 },
      ]),
    ).toStrictEqual({ x: 300, y: 600 });
  });

  it("reads a drag that stalled before release as slow", () => {
    const state = drag({
      direction: "down",
      path: [
        { x: 100, y: 400, time: 16 },
        // Same position, 200ms later: everything before it falls out of the
        // window, so the release carries no velocity.
        { x: 100, y: 400, time: 216 },
      ],
    });

    expect(getSwipeVelocity(state.samples)).toStrictEqual({ x: 0, y: 0 });
  });

  it("has no velocity from a single sample", () => {
    expect(getSwipeVelocity([{ x: 5, y: 5, time: 10 }])).toStrictEqual({
      x: 0,
      y: 0,
    });
  });
});

describe("dismissal decision", () => {
  const velocityThreshold = 500;

  const release = (direction: Direction, distance: number) =>
    endSwipeDrag(
      drag({
        direction,
        path: [
          { x: 100, y: 100, time: 0 },
          {
            x:
              direction === "left" || direction === "right"
                ? 100 + distance
                : 100,
            y:
              direction === "up" || direction === "down" ? 100 + distance : 100,
            time: 100,
          },
        ],
      }),
      { direction, velocityThreshold },
    );

  it.each(directions)("dismisses a fast flick %s", (direction) => {
    const distance = direction === "up" || direction === "left" ? -200 : 200;

    // 200px in 100ms is 2000px/s, four times the threshold.
    expect(release(direction, distance).shouldDismiss).toBe(true);
  });

  it.each(directions)("keeps a slow drag %s open", (direction) => {
    const distance = direction === "up" || direction === "left" ? -30 : 30;

    // 300px/s, under the 500px/s threshold, however far it travelled.
    expect(release(direction, distance).shouldDismiss).toBe(false);
  });

  it("ignores a flick the wrong way", () => {
    expect(release("down", -200).shouldDismiss).toBe(false);
  });

  it("never dismisses a press that stayed inside the slop", () => {
    const state = drag({
      direction: "down",
      path: [{ x: 100, y: 104, time: 1 }],
    });

    expect(
      endSwipeDrag(state, { direction: "down", velocityThreshold }),
    ).toStrictEqual({
      shouldDismiss: false,
      velocity: { x: 0, y: 4000 },
    });
  });
});

describe("layout helpers", () => {
  it("sends each direction off its own edge", () => {
    const screen = { height: 800, width: 400 };

    expect(
      directions.map((direction) => getSwipeRange({ direction, ...screen })),
    ).toStrictEqual([-800, 800, -400, 400]);
  });

  it("leaves the browser the axis the swipe does not use", () => {
    expect(getSwipeTouchAction("down")).toBe("pan-x");
    expect(getSwipeTouchAction("left")).toBe("pan-y");
    expect(getSwipeTouchAction(undefined)).toBe("");
  });
});
