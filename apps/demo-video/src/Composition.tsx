import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Composition,
  Easing,
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

const COLORS = {
  ink: "#11100f",
  panel: "#1c1a18",
  surface: "#292521",
  muted: "#aaa198",
  paperMuted: "#6d665e",
  line: "#474039",
  paper: "#f3ecdf",
  rose: "#c9717f",
  roseDark: "#8f4053",
  gold: "#c3a66f",
  sage: "#94a28a",
  shadow: "#090807",
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

const BrandMark: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg
      viewBox="0 0 48 48"
      style={{
        position: "relative",
        width: 44,
        height: 44,
        overflow: "visible",
      }}
    >
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="12"
        fill={COLORS.roseDark}
        stroke={COLORS.gold}
        strokeWidth="2"
      />
      <path
        d="M27.2 17.2L31.2 4.2L35.4 17.4Z"
        fill={COLORS.gold}
        stroke={COLORS.ink}
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M28.5 16.8C36 17.6 41.2 22.5 41.2 29.3C37.2 28.3 34.2 30.1 31.6 34.3C28.8 38.8 23.4 41 18.2 38.8C14.4 37.2 12.3 34.2 12 30.5C17.7 30.6 20.6 27.7 20.6 22.9C20.6 19.3 23.5 16.8 28.5 16.8Z"
        fill={COLORS.paper}
        stroke={COLORS.ink}
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M22.6 18.1C17.6 18.9 14.2 22.8 14.2 28.4C17.8 28 20.7 25.1 20.7 21.6C20.7 20.1 21.4 18.8 22.6 18.1Z"
        fill={COLORS.rose}
        stroke={COLORS.ink}
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M23.6 17.5L20.4 11.5L29.2 16.7Z"
        fill={COLORS.paper}
        stroke={COLORS.ink}
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <circle cx="31.8" cy="24.2" r="1.8" fill={COLORS.ink} />
      <path
        d="M41 3C41.5 6 43 7.5 46 8C43 8.5 41.5 10 41 13C40.5 10 39 8.5 36 8C39 7.5 40.5 6 41 3Z"
        fill={COLORS.gold}
        style={{
          opacity: interpolate(frame, [0, 16, 40, 58], [0.35, 1, 0.5, 0.35], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 16, 40, 58], [0.7, 1, 0.82, 0.7], {
            easing: Easing.bezier(0.34, 1.35, 0.64, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      />
    </svg>
  );
};

const MagicField: React.FC = () => {
  return (
    <>
      <Sparkle color={COLORS.gold} delay={0} left={1518} size={20} top={84} />
      <Sparkle color={COLORS.sage} delay={24} left={786} size={11} top={95} />
      <Sparkle color={COLORS.rose} delay={42} left={27} size={14} top={787} />
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
          width: 112,
          height: 1,
          backgroundColor: COLORS.line,
        }}
      />
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
        top: 190,
        width: 680,
        height: 520,
        padding: "54px 54px",
        boxSizing: "border-box",
        backgroundColor: COLORS.panel,
        border: `2px solid ${COLORS.line}`,
        boxShadow: `10px 10px 0 ${COLORS.shadow}`,
        opacity: interpolate(frame, [7, 28, 285, 315], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [7, 28, 285, 315],
          ["0px 28px", "0px 0px", "0px 0px", "-36px 0px"],
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
          top: 0,
          left: 0,
          width: interpolate(frame, [18, 58], [0, 680], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 6,
          backgroundColor: COLORS.rose,
        }}
      />

      <div
        style={{
          fontFamily: "JetBrains Mono",
          fontSize: 29,
          lineHeight: 1.65,
          color: COLORS.paper,
          letterSpacing: -0.5,
        }}
      >
        <div>
          <span style={{ color: COLORS.muted }}>const </span>
          <span style={{ fontWeight: 700 }}>result</span>
          <span style={{ color: COLORS.muted }}> = </span>
          <span style={{ color: COLORS.rose, fontWeight: 700 }}>await</span>
          <span style={{ color: COLORS.paper }}> magicModal</span>
        </div>
        <div style={{ paddingLeft: 34 }}>
          <span style={{ color: COLORS.gold, fontWeight: 700 }}>.show</span>
          <span style={{ color: COLORS.paper }}>&lt;</span>
          <span style={{ color: COLORS.sage }}>RatingAnswer</span>
          <span style={{ color: COLORS.paper }}>&gt;(</span>
        </div>
        <div style={{ paddingLeft: 68 }}>
          <span style={{ color: COLORS.paper }}>RatingModal</span>
          <span style={{ color: COLORS.paper }}>).promise;</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 54,
          right: 54,
          bottom: 55,
          height: 1,
          backgroundColor: COLORS.line,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 54,
          bottom: 26,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "JetBrains Mono",
          fontSize: 17,
          color: COLORS.muted,
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
              [COLORS.gold, COLORS.sage],
            )}
          />
        </svg>
        promise pending
      </div>
    </Interactive.Div>
  );
};

const Tether: React.FC = () => {
  const frame = useCurrentFrame();
  const tetherColor = interpolateColors(
    frame,
    [250, 266],
    [COLORS.gold, COLORS.sage],
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
          border: `3px solid ${COLORS.ink}`,
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
        borderRadius: "32px 32px 12px 12px",
        backgroundColor: COLORS.paper,
        color: COLORS.panel,
        border: `2px solid ${COLORS.panel}`,
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
          backgroundColor: "#b9b2a7",
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
            backgroundColor: COLORS.roseDark,
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
            color: COLORS.paperMuted,
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
          color: "#645f57",
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
                border: `2px solid ${isSelected ? COLORS.roseDark : "#c9c2b7"}`,
                backgroundColor: isSelected ? "#d7a0a5" : "#ebe5da",
                color: COLORS.panel,
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
        borderRadius: "32px 32px 12px 12px",
        backgroundColor: COLORS.paper,
        color: COLORS.panel,
        border: `2px solid ${COLORS.panel}`,
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
          backgroundColor: "#b9b2a7",
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
            backgroundColor: COLORS.roseDark,
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
            color: COLORS.paperMuted,
          }}
        >
          StoreReviewModal
        </div>
      </div>

      <div
        style={{
          maxWidth: 500,
          fontFamily: "Instrument Sans",
          fontWeight: 780,
          fontSize: 52,
          lineHeight: 0.98,
          letterSpacing: -2,
        }}
      >
        Would you leave a rating in the app store?
      </div>
      <div
        style={{
          marginTop: 17,
          fontFamily: "Instrument Sans",
          fontSize: 25,
          color: "#645f57",
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
            border: `2px solid ${COLORS.panel}`,
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
            backgroundColor: interpolateColors(
              frame,
              [220, 235, 245],
              [COLORS.panel, COLORS.roseDark, COLORS.panel],
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
        padding: "96px 58px 58px",
        boxSizing: "border-box",
        borderRadius: "32px 32px 12px 12px",
        backgroundColor: COLORS.paper,
        color: COLORS.panel,
        border: `2px solid ${COLORS.panel}`,
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
      <Sparkle color={COLORS.rose} delay={260} left={112} size={17} top={142} />
      <div
        style={{
          width: 76,
          height: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 99,
          backgroundColor: COLORS.sage,
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
            borderLeft: `8px solid ${COLORS.panel}`,
            borderBottom: `8px solid ${COLORS.panel}`,
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
          color: "#645f57",
        }}
      >
        The promise resolves with the result.
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
        backgroundColor: COLORS.panel,
        border: `2px solid ${COLORS.line}`,
        boxShadow: `10px 10px 0 ${COLORS.shadow}`,
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
            [COLORS.gold, COLORS.sage],
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
            frame >= 126 && frame < 156 ? COLORS.roseDark : "transparent",
          color: frame >= 126 && frame < 156 ? COLORS.paper : COLORS.muted,
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
        top: 180,
        width: 1180,
        height: 550,
        padding: "66px 72px",
        boxSizing: "border-box",
        backgroundColor: COLORS.panel,
        border: `2px solid ${COLORS.line}`,
        boxShadow: `12px 12px 0 ${COLORS.shadow}`,
        opacity: interpolate(frame, [292, 316, 365, 386], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [292, 316, 365, 386],
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
          marginBottom: 52,
          fontFamily: "JetBrains Mono",
          fontSize: 21,
          color: COLORS.sage,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          style={{ width: 17, height: 17, overflow: "visible" }}
        >
          <path
            d="M16 0C17.7 9.7 22.3 14.3 32 16C22.3 17.7 17.7 22.3 16 32C14.3 22.3 9.7 17.7 0 16C9.7 14.3 14.3 9.7 16 0Z"
            fill={COLORS.sage}
          />
        </svg>
        typed result
      </div>

      <div
        style={{
          fontFamily: "JetBrains Mono",
          fontSize: 33,
          lineHeight: 1.55,
          color: COLORS.paper,
          letterSpacing: -0.8,
        }}
      >
        <div
          style={{
            opacity: interpolate(frame, [306, 320], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [306, 320], ["0px 16px", "0px 0px"], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: COLORS.muted }}>const </span>
          <span style={{ fontWeight: 750 }}>result</span>
          <span style={{ color: COLORS.muted }}>: </span>
          <span style={{ color: COLORS.gold }}>HideReturn</span>
          <span>&lt;</span>
          <span style={{ color: COLORS.sage }}>RatingAnswer</span>
          <span>&gt; = {"{"}</span>
        </div>
        <div
          style={{
            paddingLeft: 48,
            opacity: interpolate(frame, [316, 330], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [316, 330], ["0px 16px", "0px 0px"], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: COLORS.muted }}>reason: </span>
          <span style={{ color: COLORS.rose }}>MagicModalHideReason</span>
          <span>.</span>
          <span style={{ color: COLORS.sage }}>INTENTIONAL_HIDE</span>
          <span>,</span>
        </div>
        <div
          style={{
            paddingLeft: 48,
            opacity: interpolate(frame, [326, 340], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [326, 340], ["0px 16px", "0px 0px"], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span style={{ color: COLORS.muted }}>data: </span>
          <span>{"{ "}</span>
          <span style={{ color: COLORS.gold }}>score</span>
          <span>: </span>
          <span style={{ color: COLORS.rose }}>5</span>
          <span>{" },"}</span>
        </div>
        <div
          style={{
            opacity: interpolate(frame, [336, 350], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [336, 350], ["0px 16px", "0px 0px"], {
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
        opacity: interpolate(frame, [370, 392, 427, 449], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [370, 392, 427, 449],
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
          color: COLORS.panel,
          letterSpacing: -1.2,
        }}
      >
        <span style={{ color: COLORS.roseDark }}>pnpm add </span>
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
          backgroundColor: COLORS.roseDark,
        }}
      />
    </Interactive.Div>
  );
};

export const MagicModalDemo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.ink,
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
          backgroundColor: COLORS.line,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 48,
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: COLORS.line,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 124,
          height: 1,
          backgroundColor: COLORS.line,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 54,
          height: 1,
          backgroundColor: COLORS.line,
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

export const RemotionVideo: React.FC = () => {
  return (
    <Composition
      id="MagicModalDemo"
      component={MagicModalDemo}
      durationInFrames={450}
      fps={30}
      width={1600}
      height={900}
    />
  );
};
