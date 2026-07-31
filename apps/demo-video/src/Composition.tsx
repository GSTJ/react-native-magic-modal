import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  Interactive,
  interpolate,
  interpolateColors,
  staticFile,
  useCurrentFrame,
} from "remotion";

loadFont({
  family: "Instrument Sans",
  url: staticFile("fonts/instrument-sans-variable.woff2"),
  format: "woff2",
  weight: "100 900",
  display: "block",
});

loadFont({
  family: "Instrument Serif",
  url: staticFile("fonts/instrument-serif-italic.woff2"),
  format: "woff2",
  weight: "400",
  style: "italic",
  display: "block",
});

loadFont({
  family: "JetBrains Mono",
  url: staticFile("fonts/jetbrains-mono-variable.woff2"),
  format: "woff2",
  weight: "100 800",
  display: "block",
});

/**
 * Lifted from the landing page so the video and the site cannot drift.
 * Every value below is a `--mm-*` custom property declared on `.magic-home` in
 * `apps/docs/app/(home)/home.css`, or a syntax token colour from the same file.
 * The recovered composition carried its own approximations of these — close
 * enough to look intentional next to the site, far enough to look wrong.
 *
 * `gold` is `--mm-blue` upstream. The name there is a leftover from an earlier
 * palette; it has been a warm ochre for a while. Kept honest here rather than
 * copying a variable name that describes the wrong colour.
 */
const COLORS = {
  canvas: "#11100e",
  ink: "#151411",
  inkSoft: "#24221e",
  surface: "#191714",
  paper: "#f2ede3",
  paperBright: "#fffdf7",
  fgMuted: "#aaa298",
  muted: "#655f56",
  line: "#c9c1b5",
  darkLine: "#37332d",
  coral: "#c56178",
  lime: "#aab79d",
  gold: "#9f835b",
  goldDeep: "#785f3f",
  // Not a landing token. The hero's cards sit on a scrolling page and lift with
  // a coral offset; three stacked coral offsets in one still would be noise, so
  // only the code panel keeps that treatment and the rest drop to a plain hard
  // shadow one step darker than the canvas.
  shadow: "#0a0908",
} as const;

/**
 * `.mm-flow-code` and its `.mm-syntax-token-*` rules. The code panel in this
 * video is the same object as the one in the hero, so it reads from the same
 * highlighter.
 */
const CODE = {
  fg: "#dcd6cb",
  dim: "#888278",
  dot: "#575149",
  rule: "#34312c",
  keyword: "#ff987e",
  type: "#91a5ff",
  fn: "#82d2ce",
  property: "#e9adff",
  operator: "#aaa298",
  punctuation: "#777168",
} as const;

const Sparkle: React.FC<{
  color: string;
  delay?: number;
  left: number;
  size: number;
  top: number;
}> = ({ color, delay = 0, left, size, top }) => {
  const frame = useCurrentFrame();

  return (
    <svg
      viewBox="0 0 32 32"
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        overflow: "visible",
        opacity: interpolate(
          frame,
          [delay, delay + 12, delay + 46, delay + 62],
          [0.24, 0.9, 0.58, 0.24],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
        rotate: interpolate(frame, [delay, delay + 90], ["-8deg", "10deg"], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(
          frame,
          [delay, delay + 18, delay + 46, delay + 62],
          [0.72, 1, 0.84, 0.72],
          {
            easing: Easing.bezier(0.34, 1.35, 0.64, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <path
        d="M16 0C17.7 9.7 22.3 14.3 32 16C22.3 17.7 17.7 22.3 16 32C14.3 22.3 9.7 17.7 0 16C9.7 14.3 14.3 9.7 16 0Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * `public/magic-mark.svg` is a byte copy of the `<svg>` returned by
 * `apps/docs/components/magic-mark.tsx`, which is what the landing renders in
 * its nav, its footer and its 404. Copied rather than imported: reaching into
 * the docs package would put next and fumadocs in this package's dependency
 * tree, and this package exists to stay out of the library's install path.
 *
 * If the mark changes over there, re-copy it. Nothing here will notice on its
 * own.
 *
 * The mark's own palette is deliberately electric where the page is warm —
 * violet, hot pink and spring mint against ochre and coral. That contrast is
 * the landing's choice, not an accident, so it survives the trip intact and
 * only picks up the violet halo the site gives it in `.magic-brand svg`.
 */
const BrandMark: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <Img
    src={staticFile("magic-mark.svg")}
    style={{
      width: size,
      height: size,
      filter: `drop-shadow(0 ${size * 0.14}px ${size * 0.32}px rgba(124, 92, 255, 0.18))`,
    }}
  />
);

const MagicField: React.FC = () => {
  return (
    <>
      <Sparkle color={COLORS.gold} delay={0} left={1518} size={20} top={84} />
      <Sparkle color={COLORS.lime} delay={24} left={786} size={11} top={95} />
      <Sparkle color={COLORS.coral} delay={42} left={27} size={14} top={787} />
    </>
  );
};

const Header: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        left: 80,
        right: 80,
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          color: COLORS.paper,
          fontFamily: "Instrument Sans",
          fontWeight: 700,
          fontSize: 27,
          letterSpacing: -0.6,
        }}
      >
        <BrandMark />
        Magic Modal
      </div>
      <div
        style={{
          fontFamily: "JetBrains Mono",
          fontSize: 19,
          letterSpacing: -0.2,
          color: CODE.dim,
        }}
      >
        One API for web, iOS, and Android
      </div>
    </div>
  );
};

const CodePanel: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Caller code"
      style={{
        position: "absolute",
        left: 80,
        // Sized to the two lines it holds and centred on the tether at y=444,
        // so the panel and the portal read as one horizontal axis.
        top: 234,
        width: 680,
        height: 420,
        boxSizing: "border-box",
        backgroundColor: COLORS.ink,
        overflow: "hidden",
        // `.mm-flow-code`: no border, a coral slab thrown down and to the
        // right. It is the one loud thing in the frame, which is why the head
        // rule above is neutral and the only other coral is the first dot —
        // coral on three edges at once reads as a broken frame, not a lift.
        boxShadow: `12px 16px 0 ${COLORS.coral}`,
        opacity: interpolate(frame, [0, 18, 285, 315], [0.4, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [0, 18, 285, 315],
          ["0px 22px", "0px 0px", "0px 0px", "-36px 0px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      {/* The hero draws a coral rule across the top of this panel. A full-width
          bar up there plus the offset slab below reads as three sides of a
          frame, so the rule moves down onto the head's own border, where it
          still gets to sweep in and no longer closes a shape. */}
      <div
        style={{
          position: "absolute",
          top: 63,
          left: 0,
          width: interpolate(frame, [18, 58], [0, 680], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 3,
          backgroundColor: CODE.rule,
          zIndex: 2,
        }}
      />

      {/* `.mm-flow-code-head`: three dots, first one coral, and the filename
          the hero uses for this very snippet. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 34px",
          boxSizing: "border-box",
          borderBottom: `1px solid ${CODE.rule}`,
        }}
      >
        <div style={{ display: "flex", gap: 9 }}>
          {[CODE.dot, CODE.dot, CODE.dot].map((dot, index) => (
            <div
              key={index}
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                backgroundColor: index === 0 ? COLORS.coral : dot,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            color: CODE.dim,
          }}
        >
          rating-flow.tsx
        </div>
      </div>

      {/* Two lines, broken exactly where the hero breaks the same call: after
          the receiver, so the whole `.show<T>(Arg)` stays on one line. Nothing
          splits mid-identifier and nothing splits mid-call.

          The gutter is the hero's too. Two lines in a 420px panel would float
          in the middle of nowhere without it; numbered, the space underneath
          reads as the rest of a file. */}
      <div
        style={{
          position: "absolute",
          top: 124,
          left: 34,
          right: 34,
          display: "flex",
          gap: 26,
          fontFamily: "JetBrains Mono",
          fontSize: 26,
          lineHeight: 1.72,
          letterSpacing: -0.4,
        }}
      >
        <div style={{ color: CODE.dot, textAlign: "right", width: 30 }}>
          <div>01</div>
          <div>02</div>
        </div>
        <div style={{ color: CODE.fg }}>
          <div>
            <span style={{ color: CODE.keyword }}>const </span>
            <span style={{ color: CODE.fg }}>result</span>
            <span style={{ color: CODE.operator }}> = </span>
            <span style={{ color: CODE.keyword }}>await </span>
            <span style={{ color: CODE.fg }}>magicModal</span>
          </div>
          <div style={{ paddingLeft: 42 }}>
            <span style={{ color: CODE.punctuation }}>.</span>
            <span style={{ color: CODE.fn }}>show</span>
            <span style={{ color: CODE.punctuation }}>&lt;</span>
            <span style={{ color: CODE.type }}>RatingAnswer</span>
            <span style={{ color: CODE.punctuation }}>&gt;(</span>
            <span style={{ color: CODE.fg }}>RatingModal</span>
            <span style={{ color: CODE.punctuation }}>);</span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          bottom: 55,
          height: 1,
          backgroundColor: CODE.rule,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 34,
          bottom: 26,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "JetBrains Mono",
          fontSize: 18,
          color: CODE.dim,
          opacity: interpolate(frame, [250, 262], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <svg
          viewBox="0 0 32 32"
          style={{
            width: 14,
            height: 14,
            overflow: "visible",
            rotate: interpolate(frame, [245, 270], ["-8deg", "8deg"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [245, 260, 270], [0.8, 1.22, 1], {
              easing: Easing.bezier(0.34, 1.35, 0.64, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <path
            d="M16 0C17.7 9.7 22.3 14.3 32 16C22.3 17.7 17.7 22.3 16 32C14.3 22.3 9.7 17.7 0 16C9.7 14.3 14.3 9.7 16 0Z"
            fill={interpolateColors(
              frame,
              [250, 266],
              [COLORS.gold, COLORS.lime],
            )}
          />
        </svg>
        awaiting the handle
      </div>
    </Interactive.Div>
  );
};

const Tether: React.FC = () => {
  const frame = useCurrentFrame();
  const tetherColor = interpolateColors(
    frame,
    [250, 266],
    [COLORS.gold, COLORS.lime],
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 760,
        top: 444,
        width: interpolate(frame, [48, 76, 280, 305], [0, 90, 90, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        height: 3,
        backgroundColor: tetherColor,
        opacity: interpolate(frame, [45, 60, 285, 305], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -7,
          top: -6,
          width: 15,
          height: 15,
          borderRadius: 99,
          backgroundColor: tetherColor,
          border: `3px solid ${COLORS.canvas}`,
        }}
      />
    </div>
  );
};

const RatingSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const selected = frame >= 126;

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        right: 28,
        bottom: 28,
        height: 510,
        padding: "48px 44px",
        boxSizing: "border-box",
        borderRadius: "30px 30px 5px 5px",
        backgroundColor: COLORS.paperBright,
        color: COLORS.ink,
        border: `2px solid ${COLORS.ink}`,
        opacity: interpolate(frame, [52, 73, 151, 169], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [52, 73, 151, 169],
          ["0px 130px", "0px 0px", "0px 0px", "0px 84px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          width: 72,
          height: 6,
          marginLeft: -36,
          borderRadius: 99,
          backgroundColor: COLORS.line,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 35,
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: COLORS.coral,
            color: COLORS.paper,
            fontFamily: "JetBrains Mono",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          01
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            color: COLORS.muted,
          }}
        >
          RatingModal
        </div>
      </div>

      <div
        style={{
          fontFamily: "Instrument Sans",
          fontWeight: 780,
          fontSize: 58,
          lineHeight: 0.96,
          letterSpacing: -2.4,
        }}
      >
        Rate the app
      </div>
      <div
        style={{
          marginTop: 17,
          fontFamily: "Instrument Sans",
          fontSize: 27,
          color: COLORS.muted,
        }}
      >
        How's the app working for you?
      </div>

      <div
        style={{
          marginTop: 44,
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 10,
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((rating) => {
          const isSelected = rating === 5 && selected;
          return (
            <div
              key={rating}
              style={{
                height: 78,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                border: `2px solid ${isSelected ? COLORS.coral : "#e0d9cc"}`,
                backgroundColor: isSelected ? COLORS.coral : COLORS.paper,
                color: isSelected ? COLORS.paperBright : COLORS.ink,
                fontFamily: "JetBrains Mono",
                fontWeight: 800,
                fontSize: 25,
                scale:
                  rating === 5
                    ? interpolate(frame, [121, 129, 136], [1, 0.92, 1], {
                        easing: Easing.bezier(0.34, 1.35, 0.64, 1),
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      })
                    : 1,
              }}
            >
              {rating}
            </div>
          );
        })}
      </div>

      {/* The hero prints this line under its own rating row. Without it the
          bottom third of the sheet is blank paper for two seconds. */}
      <div
        style={{
          marginTop: 26,
          fontFamily: "Instrument Sans",
          fontSize: 21,
          color: COLORS.muted,
        }}
      >
        Drag down or tap outside to close.
      </div>
    </div>
  );
};

const StoreReviewSheet: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        right: 28,
        bottom: 28,
        height: 510,
        padding: "48px 44px",
        boxSizing: "border-box",
        borderRadius: "30px 30px 5px 5px",
        backgroundColor: COLORS.paperBright,
        color: COLORS.ink,
        border: `2px solid ${COLORS.ink}`,
        opacity: interpolate(frame, [156, 178, 242, 258], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [156, 178, 242, 258],
          ["0px 135px", "0px 0px", "0px 0px", "0px 78px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          width: 72,
          height: 6,
          marginLeft: -36,
          borderRadius: 99,
          backgroundColor: COLORS.line,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 31,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.coral,
            color: COLORS.paper,
            fontFamily: "JetBrains Mono",
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          5
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            color: COLORS.muted,
          }}
        >
          StoreReviewModal
        </div>
      </div>

      <div
        style={{
          maxWidth: 465,
          fontFamily: "Instrument Sans",
          fontWeight: 780,
          fontSize: 45,
          lineHeight: 1.02,
          letterSpacing: -1.6,
        }}
      >
        Would you leave a rating in the app store?
      </div>
      <div
        style={{
          marginTop: 17,
          fontFamily: "Instrument Sans",
          fontSize: 25,
          color: COLORS.muted,
        }}
      >
        Choosing 5 opens the store prompt.
      </div>

      <div
        style={{
          position: "absolute",
          left: 44,
          right: 44,
          bottom: 44,
          display: "grid",
          gridTemplateColumns: "0.72fr 1.28fr",
          gap: 12,
        }}
      >
        <div
          style={{
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            border: `2px solid ${COLORS.ink}`,
            fontFamily: "Instrument Sans",
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          Not now
        </div>
        <div
          style={{
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            // Three-stop interpolation spent ~15 frames somewhere between ink
            // and coral, which is a dead maroon. Snap in, hold, snap back.
            backgroundColor: interpolateColors(
              frame,
              [228, 231, 243, 246],
              [COLORS.ink, COLORS.coral, COLORS.coral, COLORS.ink],
            ),
            color: COLORS.paper,
            fontFamily: "Instrument Sans",
            fontWeight: 760,
            fontSize: 24,
            scale: interpolate(frame, [220, 232, 242], [1, 0.97, 1], {
              easing: Easing.bezier(0.34, 1.35, 0.64, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Open the store
        </div>
      </div>
    </div>
  );
};

const ThanksSheet: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        right: 28,
        bottom: 28,
        height: 510,
        padding: "58px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: "30px 30px 5px 5px",
        backgroundColor: COLORS.paperBright,
        color: COLORS.ink,
        border: `2px solid ${COLORS.ink}`,
        opacity: interpolate(frame, [244, 263, 290, 308], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [244, 263, 290, 308],
          ["0px 125px", "0px 0px", "0px 0px", "0px 84px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <Sparkle color={COLORS.gold} delay={252} left={166} size={31} top={53} />
      <Sparkle
        color={COLORS.coral}
        delay={260}
        left={112}
        size={17}
        top={142}
      />
      <div
        style={{
          width: 76,
          height: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 99,
          backgroundColor: COLORS.lime,
          fontFamily: "Instrument Sans",
          fontSize: 43,
          fontWeight: 900,
          scale: interpolate(frame, [253, 269, 280], [0.5, 1.08, 1], {
            easing: Easing.bezier(0.34, 1.35, 0.64, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            width: 28,
            height: 16,
            borderLeft: `8px solid ${COLORS.ink}`,
            borderBottom: `8px solid ${COLORS.ink}`,
            rotate: "-45deg",
            translate: "0px -4px",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 42,
          fontFamily: "Instrument Sans",
          fontWeight: 800,
          fontSize: 74,
          lineHeight: 0.95,
          letterSpacing: -3,
        }}
      >
        Thank you.
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: "Instrument Sans",
          fontSize: 30,
          color: COLORS.muted,
        }}
      >
        The handle resolves with the result.
      </div>
    </div>
  );
};

const PortalStage: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Modal portal"
      style={{
        position: "absolute",
        left: 850,
        top: 140,
        width: 670,
        height: 650,
        backgroundColor: COLORS.ink,
        borderRadius: 22,
        // The hero frames its device in ochre. Same frame here, so the portal
        // reads as a device and not as a second code panel.
        border: `2px solid ${COLORS.goldDeep}`,
        boxShadow: `10px 14px 0 ${COLORS.shadow}`,
        overflow: "hidden",
        opacity: interpolate(frame, [45, 68, 286, 313], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [45, 68, 286, 313],
          ["32px 0px", "0px 0px", "0px 0px", "34px 0px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: COLORS.surface,
        }}
      />
      <svg
        viewBox="0 0 32 32"
        style={{
          position: "absolute",
          top: 30,
          left: 32,
          width: 18,
          height: 18,
          overflow: "visible",
        }}
      >
        <path
          d="M16 0C17.7 9.7 22.3 14.3 32 16C22.3 17.7 17.7 22.3 16 32C14.3 22.3 9.7 17.7 0 16C9.7 14.3 14.3 9.7 16 0Z"
          fill={interpolateColors(
            frame,
            [250, 266],
            [COLORS.gold, COLORS.lime],
          )}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 29,
          right: 32,
          padding: "7px 11px",
          backgroundColor:
            frame >= 126 && frame < 156 ? COLORS.coral : "transparent",
          color: frame >= 126 && frame < 156 ? COLORS.paper : COLORS.fgMuted,
          fontFamily: "JetBrains Mono",
          fontSize: 17,
          fontWeight: 700,
        }}
      >
        {frame >= 126 && frame < 156 ? "score: 5" : ""}
      </div>

      <RatingSheet />
      <StoreReviewSheet />
      <ThanksSheet />
    </Interactive.Div>
  );
};

const ResultReceipt: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Typed result"
      style={{
        position: "absolute",
        left: 210,
        // 380 is the four lines plus their padding. Anything taller and the
        // card ends in a band of empty ink under the closing brace.
        top: 260,
        width: 1180,
        height: 380,
        padding: "56px 72px",
        boxSizing: "border-box",
        backgroundColor: COLORS.ink,
        borderRadius: 18,
        border: `1px solid ${CODE.rule}`,
        boxShadow: `12px 12px 0 ${COLORS.shadow}`,
        opacity: interpolate(frame, [292, 303, 365, 378], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [292, 303, 365, 378],
          ["0px 34px", "0px 0px", "0px 0px", "0px -28px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 40,
          fontFamily: "JetBrains Mono",
          fontSize: 21,
          color: COLORS.lime,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          style={{ width: 17, height: 17, overflow: "visible" }}
        >
          <path
            d="M16 0C17.7 9.7 22.3 14.3 32 16C22.3 17.7 17.7 22.3 16 32C14.3 22.3 9.7 17.7 0 16C9.7 14.3 14.3 9.7 16 0Z"
            fill={COLORS.lime}
          />
        </svg>
        typed result
      </div>

      <div
        style={{
          fontFamily: "JetBrains Mono",
          fontSize: 33,
          lineHeight: 1.55,
          color: CODE.fg,
          letterSpacing: -0.8,
        }}
      >
        <div
          style={{
            opacity: interpolate(frame, [298, 310], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [298, 310], ["0px 16px", "0px 0px"], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: CODE.keyword }}>const </span>
          <span>result</span>
          <span style={{ color: CODE.punctuation }}>: </span>
          <span style={{ color: CODE.type }}>HideReturn</span>
          <span style={{ color: CODE.punctuation }}>&lt;</span>
          <span style={{ color: CODE.type }}>RatingAnswer</span>
          <span style={{ color: CODE.punctuation }}>&gt;</span>
          <span style={{ color: CODE.operator }}> = </span>
          <span style={{ color: CODE.punctuation }}>{"{"}</span>
        </div>
        <div
          style={{
            paddingLeft: 48,
            opacity: interpolate(frame, [307, 319], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [307, 319], ["0px 16px", "0px 0px"], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: CODE.property }}>reason</span>
          <span style={{ color: CODE.punctuation }}>: </span>
          <span style={{ color: CODE.type }}>MagicModalHideReason</span>
          <span style={{ color: CODE.punctuation }}>.</span>
          <span style={{ color: CODE.property }}>INTENTIONAL_HIDE</span>
          <span style={{ color: CODE.punctuation }}>,</span>
        </div>
        <div
          style={{
            paddingLeft: 48,
            opacity: interpolate(frame, [316, 328], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [316, 328], ["0px 16px", "0px 0px"], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: CODE.property }}>data</span>
          <span style={{ color: CODE.punctuation }}>: </span>
          <span style={{ color: CODE.punctuation }}>{"{ "}</span>
          <span style={{ color: CODE.property }}>score</span>
          <span style={{ color: CODE.punctuation }}>: </span>
          <span style={{ color: COLORS.lime }}>5</span>
          <span style={{ color: CODE.punctuation }}>{" },"}</span>
        </div>
        <div
          style={{
            opacity: interpolate(frame, [325, 337], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [325, 337], ["0px 16px", "0px 0px"], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {"};"}
        </div>
      </div>
    </Interactive.Div>
  );
};

const InstallCard: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Install command"
      style={{
        position: "absolute",
        left: 250,
        top: 310,
        width: 1100,
        height: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.paper,
        border: `2px solid ${COLORS.paper}`,
        boxShadow: `10px 10px 0 ${COLORS.shadow}`,
        opacity: interpolate(frame, [370, 379, 440, 449], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [370, 379, 440, 449],
          ["0px 28px", "0px 0px", "0px 0px", "0px -20px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono",
          fontWeight: 650,
          fontSize: 39,
          color: COLORS.ink,
          letterSpacing: -1.2,
        }}
      >
        <span style={{ color: COLORS.coral }}>pnpm add </span>
        {/* v10: rename this to `magic-modal` once the npm rename ships. */}
        react-native-magic-modal
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: interpolate(frame, [384, 414], [0, 1100], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 7,
          backgroundColor: COLORS.coral,
        }}
      />
    </Interactive.Div>
  );
};

export const MagicModalDemo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.canvas,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: COLORS.darkLine,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 48,
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: COLORS.darkLine,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 124,
          height: 1,
          backgroundColor: COLORS.darkLine,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 54,
          height: 1,
          backgroundColor: COLORS.darkLine,
        }}
      />

      <MagicField />
      <Header />
      <CodePanel />
      <Tether />
      <PortalStage />
      <ResultReceipt />
      <InstallCard />
    </AbsoluteFill>
  );
};

/**
 * GitHub's social preview, and the site's og:image.
 *
 * 1280x640 is what GitHub asks for, and it crops that 2:1 card differently on
 * different surfaces, so everything that carries meaning sits inside a 96px
 * inset — a tenth of the frame gone from every edge and the mark, the wordmark
 * and the sentence all survive.
 *
 * It cannot be a crop of frame 130. That frame is 16:9 and its subject is two
 * panels side by side; at 2:1 you lose the portal, and at the size GitHub
 * renders a preview in a timeline the 26px code text is unreadable. So it is
 * its own composition, built out of the same tokens, holding the three things
 * that survive being shrunk: the mark, the name, and one sentence.
 */
const SocialPoster: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.canvas,
      overflow: "hidden",
      padding: 96,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    }}
  >
    {/* Same rules as the video, inset to the same margin. */}
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: COLORS.darkLine,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 48,
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: COLORS.darkLine,
      }}
    />

    {/* The coral slab, the one thing carried over from the code panel. Bottom
        edge rather than top: GitHub's preview crops are more forgiving there,
        and it reads as a baseline instead of a stray bar. */}
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: 380,
        height: 10,
        backgroundColor: COLORS.coral,
      }}
    />

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        color: COLORS.paper,
        fontFamily: "Instrument Sans",
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: -0.9,
      }}
    >
      <BrandMark size={56} />
      Magic Modal
    </div>

    <div
      style={{
        marginTop: 34,
        fontFamily: "Instrument Sans",
        fontWeight: 800,
        fontSize: 100,
        lineHeight: 1,
        letterSpacing: -4,
        color: COLORS.paper,
        whiteSpace: "nowrap",
      }}
    >
      Modals you can await
    </div>

    {/* One flat line of mono. No flex gap here — a gap between every span puts
        air around the dot and the brackets and stops it being code. */}
    <div
      style={{
        marginTop: 30,
        fontFamily: "JetBrains Mono",
        fontSize: 29,
        letterSpacing: -0.6,
      }}
    >
      <span style={{ color: CODE.keyword }}>await </span>
      <span style={{ color: CODE.fg }}>magicModal</span>
      <span style={{ color: CODE.punctuation }}>.</span>
      <span style={{ color: CODE.fn }}>show</span>
      <span style={{ color: CODE.punctuation }}>(</span>
      <span style={{ color: CODE.fg }}>RatingModal</span>
      <span style={{ color: CODE.punctuation }}>)</span>
    </div>
  </AbsoluteFill>
);

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="MagicModalDemo"
        component={MagicModalDemo}
        durationInFrames={450}
        fps={30}
        width={1600}
        height={900}
      />
      <Composition
        id="MagicModalSocial"
        component={SocialPoster}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={640}
      />
    </>
  );
};
