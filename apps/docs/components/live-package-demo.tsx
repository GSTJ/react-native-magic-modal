"use client";

/* eslint-disable react-perf/jsx-no-new-function-as-prop -- Modal choices close over the value returned to the caller. */

import type {
  HideReturn,
  ModalChildren,
  NewConfigProps,
} from "react-native-magic-modal";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MagicModalHideReason,
  MagicModalPortal,
  magicModal,
  useMagicModal,
} from "react-native-magic-modal";

type StackEntry = {
  id: string;
  label: string;
};

type TimelineEntry = StackEntry & {
  result: string;
};

type ShowTracked = <T>(
  label: string,
  component: ModalChildren,
  config?: NewConfigProps,
) => ReturnType<typeof magicModal.show<T>>;

const modalConfig = {
  animationInTiming: 180,
  animationOutTiming: 140,
  backdropColor: "rgba(13, 12, 10, 0.84)",
  onBackdropPress: ({ hide }) => {
    hide({ reason: MagicModalHideReason.BACKDROP_PRESS });
  },
  swipeDirection: "down",
  swipeVelocityThreshold: 360,
} satisfies NewConfigProps;

const initialUploadProgress = 8;
const uploadProgressUpdates = [
  { from: 8, to: 14 },
  { from: 14, to: 21 },
  { from: 21, to: 29 },
  { from: 29, to: 38 },
  { from: 38, to: 48 },
  { from: 48, to: 59 },
  { from: 59, to: 69 },
  { from: 69, to: 78 },
  { from: 78, to: 86 },
  { from: 86, to: 93 },
  { from: 93, to: 100 },
] as const;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const describeResult = <T,>(result: HideReturn<T>) => {
  if (result.reason !== MagicModalHideReason.INTENTIONAL_HIDE) {
    return result.reason;
  }

  if (result.data === undefined) {
    return "RESOLVED";
  }

  return `RETURNED ${String(result.data).toUpperCase()}`;
};

const ModalFrame = ({
  children,
  eyebrow,
  surface = "dialog",
  title,
  variant,
}: {
  children: React.ReactNode;
  eyebrow: string;
  surface?: "dialog" | "web";
  title: string;
  variant:
    | "feedback"
    | "notification"
    | "rating"
    | "store"
    | "thanks"
    | "upload";
}) => {
  const titleId = React.useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`mm-package-modal is-${surface}`}
      data-modal-kind={variant}
    >
      {surface === "web" ? (
        <div aria-hidden="true" className="mm-package-surface-bar">
          <strong>Release dashboard</strong>
          <code>app.example.com/releases</code>
        </div>
      ) : null}
      <div className="mm-package-modal-heading">
        <span aria-hidden="true" className="mm-package-spark" />
        <div>
          <span>{eyebrow}</span>
          <h3 id={titleId}>{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
};

const ScorePrompt = () => {
  const { hide } = useMagicModal<number>();

  return (
    <ModalFrame
      eyebrow="EXPERIENCE RATING"
      title="How was your experience?"
      variant="rating"
    >
      <p>
        Pick a score. Click outside or swipe down to cancel. The timeline
        records the score, BACKDROP_PRESS, or SWIPE_COMPLETE.
      </p>
      <div className="mm-package-score">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            aria-label={`Rate ${score} out of 5`}
            key={score}
            onClick={() => hide(score)}
            type="button"
          >
            {score}
          </button>
        ))}
      </div>
    </ModalFrame>
  );
};

const NotificationPrompt = () => {
  const { hide } = useMagicModal<"reviewed">();

  return (
    <ModalFrame
      eyebrow="ANOTHER CALLER"
      title="Payment needs a review"
      variant="notification"
    >
      <p>
        The notification is on top of an active rating modal. Click outside or
        swipe down to close it while the rating stays open.{" "}
        <code>hideAll()</code> closes both entries.
      </p>
      <div className="mm-package-modal-fact">
        <span>STACK POSITION</span>
        <strong>Top entry</strong>
      </div>
      <div className="mm-package-modal-actions">
        <button onClick={() => magicModal.hideAll()} type="button">
          Hide all modals
        </button>
        <button
          className="mm-package-modal-primary"
          onClick={() => hide("reviewed")}
          type="button"
        >
          Review later
        </button>
      </div>
    </ModalFrame>
  );
};

const FeedbackPrompt = () => {
  const { hide } = useMagicModal<string>();

  return (
    <ModalFrame
      eyebrow="FOLLOW-UP"
      title="What got in the way?"
      variant="feedback"
    >
      <p>
        The same caller handles this branch after the rating promise resolves.
      </p>
      <div className="mm-package-choices">
        {["Too slow", "Hard to follow", "Something broke"].map((reason) => (
          <button key={reason} onClick={() => hide(reason)} type="button">
            <span>{reason}</span>
            <code>return value</code>
          </button>
        ))}
      </div>
    </ModalFrame>
  );
};

const StorePrompt = () => {
  const { hide } = useMagicModal<"later" | "open">();

  return (
    <ModalFrame
      eyebrow="PUBLIC REVIEW"
      title="Leave a public rating?"
      variant="store"
    >
      <p>The caller opened this prompt after receiving a high score.</p>
      <div className="mm-package-modal-actions">
        <button onClick={() => hide("later")} type="button">
          Maybe later
        </button>
        <button
          className="mm-package-modal-primary"
          onClick={() => hide("open")}
          type="button"
        >
          Open review page
        </button>
      </div>
    </ModalFrame>
  );
};

const ThanksPrompt = ({ detail }: { detail: string }) => {
  const { hide } = useMagicModal<void>();

  return (
    <ModalFrame
      eyebrow="FLOW COMPLETE"
      title="Thanks for your time."
      variant="thanks"
    >
      <p>{detail}</p>
      <button
        className="mm-package-modal-primary"
        onClick={() => hide(undefined)}
        type="button"
      >
        Done
      </button>
    </ModalFrame>
  );
};

const UploadPrompt = ({
  fromProgress,
  progress,
}: {
  fromProgress: number;
  progress: number;
}) => {
  const { hide } = useMagicModal<"cancelled" | "done">();
  const [displayedProgress, setDisplayedProgress] = useState(fromProgress);
  const complete = progress === 100;

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setDisplayedProgress(progress);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [progress]);

  return (
    <ModalFrame
      eyebrow="ADVANCED UPDATE"
      surface="web"
      title={complete ? "Upload complete" : "Uploading release"}
      variant="upload"
    >
      <p>
        Each progress update replaces the modal content. Click outside or swipe
        down to cancel.
      </p>
      <progress
        aria-label={`Upload progress: ${progress}%`}
        className="mm-package-progress"
        max={100}
        value={displayedProgress}
      />
      <div className="mm-package-progress-meta">
        <strong>{progress}%</strong>
        <code>handle.update()</code>
      </div>
      <button
        className={complete ? "mm-package-modal-primary" : undefined}
        onClick={() => hide(complete ? "done" : "cancelled")}
        type="button"
      >
        {complete ? "Done" : "Cancel upload"}
      </button>
    </ModalFrame>
  );
};

const createThanksPrompt = (detail: string) => {
  const FlowThanksPrompt = () => <ThanksPrompt detail={detail} />;

  return FlowThanksPrompt;
};

export const LivePackageDemo = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [activeEntries, setActiveEntries] = useState<StackEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [ratingRunning, setRatingRunning] = useState(false);
  const [updateRunning, setUpdateRunning] = useState(false);

  const modalOpen = activeEntries.length > 0;
  const reversedStack = useMemo(
    () => [...activeEntries].reverse(),
    [activeEntries],
  );

  const record = useCallback((entry: TimelineEntry) => {
    React.startTransition(() => {
      setTimeline((current) => [entry, ...current].slice(0, 6));
    });
  }, []);

  const showTracked: ShowTracked = useCallback(
    <T,>(label: string, component: ModalChildren, config?: NewConfigProps) => {
      const handle = magicModal.show<T>(component, {
        accessibilityLabel: label,
        ...config,
      });
      const entry = { id: handle.modalID, label };

      setActiveEntries((current) => [...current, entry]);
      setTimeline((current) =>
        [{ ...entry, result: "PENDING" }, ...current].slice(0, 6),
      );

      void handle.then((result) => {
        setActiveEntries((current) =>
          current.filter(({ id }) => id !== handle.modalID),
        );
        React.startTransition(() => {
          setTimeline((current) =>
            current.map((item) =>
              item.id === handle.modalID
                ? { ...item, result: describeResult(result) }
                : item,
            ),
          );
        });
      });

      return handle;
    },
    [],
  );

  const openNotification = useCallback(async () => {
    const notification = showTracked<"reviewed">(
      "Payment notification",
      NotificationPrompt,
      modalConfig,
    );

    await notification;
  }, [showTracked]);

  const runRatingFlow = useCallback(
    async (stackNotification: boolean) => {
      if (ratingRunning || updateRunning) {
        return;
      }

      setRatingRunning(true);
      restoreFocusRef.current ??=
        document.activeElement instanceof HTMLElement &&
        document.activeElement !== document.body
          ? document.activeElement
          : null;
      const rating = showTracked<number>(
        "Rating prompt",
        ScorePrompt,
        modalConfig,
      );

      if (stackNotification) {
        await wait(320);
        await openNotification();
      }

      const ratingResult = await rating;

      if (ratingResult.reason !== MagicModalHideReason.INTENTIONAL_HIDE) {
        record({
          id: `flow-${rating.modalID}`,
          label: "Rating flow",
          result: `STOPPED BY ${ratingResult.reason}`,
        });
        setRatingRunning(false);
        return;
      }

      let detail: string;

      if (ratingResult.data <= 3) {
        const feedback = showTracked<string>(
          "Feedback prompt",
          FeedbackPrompt,
          modalConfig,
        );
        const feedbackResult = await feedback;

        detail =
          feedbackResult.reason === MagicModalHideReason.INTENTIONAL_HIDE
            ? `Feedback saved: ${feedbackResult.data}.`
            : "The feedback prompt closed.";
      } else {
        const store = showTracked<"later" | "open">(
          "Review prompt",
          StorePrompt,
          modalConfig,
        );
        const storeResult = await store;

        detail =
          storeResult.reason === MagicModalHideReason.INTENTIONAL_HIDE &&
          storeResult.data === "open"
            ? "Public review selected."
            : "Public review skipped.";
      }

      const thanks = showTracked<void>(
        "Thank-you prompt",
        createThanksPrompt(detail),
        modalConfig,
      );
      await thanks;
      setRatingRunning(false);
    },
    [openNotification, ratingRunning, record, showTracked, updateRunning],
  );

  const runUpdateDemo = useCallback(async () => {
    if (ratingRunning || updateRunning) {
      return;
    }

    setUpdateRunning(true);
    restoreFocusRef.current ??=
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;
    const handle = showTracked<"cancelled" | "done">(
      "Upload progress",
      () => <UploadPrompt fromProgress={0} progress={initialUploadProgress} />,
      modalConfig,
    );
    let resolved = false;

    void handle.then(() => {
      resolved = true;
    });

    await uploadProgressUpdates.reduce(
      (sequence, { from, to }) =>
        sequence.then(async () => {
          if (resolved) {
            return;
          }

          await wait(240);

          if (resolved) {
            return;
          }

          handle.update(() => (
            <UploadPrompt fromProgress={from} progress={to} />
          ));
          record({
            id: `update-${handle.modalID}-${to}`,
            label: "Upload content",
            result: `UPDATED TO ${to}%`,
          });
        }),
      Promise.resolve(),
    );

    await handle;
    setUpdateRunning(false);
  }, [ratingRunning, record, showTracked, updateRunning]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const home = root.closest<HTMLElement>(".magic-home");
    const liveSection = root.closest<HTMLElement>(".mm-live");
    const stageContent = root.querySelector<HTMLElement>(
      ".mm-live-package-content",
    );
    const inertTargets = [
      ...(home
        ? [...home.children].filter((element) => element !== liveSection)
        : []),
      ...(liveSection
        ? [...liveSection.children].filter((element) => !element.contains(root))
        : []),
      ...(stageContent ? [stageContent] : []),
    ].filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );

    if (!modalOpen) {
      return;
    }

    restoreFocusRef.current ??=
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;

    for (const element of inertTargets) {
      element.inert = true;
    }

    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      for (const element of inertTargets) {
        element.inert = false;
      }

      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen && !ratingRunning && !updateRunning) {
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    }
  }, [modalOpen, ratingRunning, updateRunning]);

  return (
    <div
      className={`mm-live-package${modalOpen ? " is-modal-open" : ""}`}
      ref={rootRef}
    >
      <div className="mm-live-package-content">
        <div className="mm-package-toolbar">
          <div>
            <span>PLATFORM SUPPORT</span>
            <code>Web / iOS / Android</code>
          </div>
          <div aria-live="polite" className="mm-package-count">
            <strong>{activeEntries.length}</strong>
            <span>
              {activeEntries.length === 1 ? "open modal" : "open modals"}
            </span>
          </div>
        </div>

        <div className="mm-package-grid">
          <div className="mm-package-copy">
            <span>ONE PORTAL AT THE APP ROOT</span>
            <h3>One portal owns the stack</h3>
            <p>
              Start the rating flow or stack a notification above it. The upload
              example demonstrates the advanced update() API. Each demo mounts
              through the same MagicModalPortal.
            </p>
            <div className="mm-package-actions">
              <button
                disabled={ratingRunning || updateRunning}
                onClick={(event) => {
                  restoreFocusRef.current = event.currentTarget;
                  void runRatingFlow(false);
                }}
                type="button"
              >
                {ratingRunning ? "Rating flow open" : "Start rating flow"}
              </button>
              <button
                disabled={ratingRunning || updateRunning}
                onClick={(event) => {
                  restoreFocusRef.current = event.currentTarget;
                  void runRatingFlow(true);
                }}
                type="button"
              >
                Stack a notification
              </button>
              <button
                disabled={ratingRunning || updateRunning}
                onClick={(event) => {
                  restoreFocusRef.current = event.currentTarget;
                  void runUpdateDemo();
                }}
                type="button"
              >
                {updateRunning ? "Upload in progress" : "Advanced upload"}
              </button>
            </div>
          </div>

          <div className="mm-package-code">
            <div>
              <span>CALLER</span>
              <code>rating-flow.ts</code>
            </div>
            <pre>
              <code>
                <span>const</span> result = <span>await</span> <b>magicModal</b>
                {"\n  "}.show(RatingPrompt)
              </code>
            </pre>
            <footer>
              <a href="#examples">Open the Common Flows code examples</a>
              <span>1 result per entry</span>
            </footer>
          </div>
        </div>

        <div className="mm-package-runtime">
          <article>
            <header>
              <div>
                <span>ACTIVE STACK</span>
                <strong>Top entry stays visible</strong>
              </div>
              <b>{reversedStack.length}</b>
            </header>
            <div className="mm-package-list">
              {reversedStack.length === 0 ? (
                <p>
                  <strong>The stack is empty.</strong>
                  Modal content mounts after show() runs.
                </p>
              ) : (
                reversedStack.map((entry, index) => (
                  <div key={entry.id}>
                    <span>{reversedStack.length - index}</span>
                    <p>
                      <strong>{entry.label}</strong>
                      <code>{entry.id.slice(0, 7)}</code>
                    </p>
                    <b>{index === 0 ? "VISIBLE" : "WAITING"}</b>
                  </div>
                ))
              )}
            </div>
          </article>

          <article aria-live="polite">
            <header>
              <div>
                <span>PROMISE RESULTS</span>
                <strong>Each promise resolves separately</strong>
              </div>
            </header>
            <div className="mm-package-list is-timeline">
              {timeline.length === 0 ? (
                <p>
                  <strong>No calls yet.</strong>
                  Resolved values appear here.
                </p>
              ) : (
                timeline.map((entry) => (
                  <div key={`${entry.id}-${entry.result}`}>
                    <p>
                      <strong>{entry.label}</strong>
                    </p>
                    <b>{entry.result}</b>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </div>

      <div
        aria-hidden={!modalOpen}
        className="mm-direct-portal"
        data-testid="live-magic-modal-portal"
      >
        <MagicModalPortal />
      </div>
    </div>
  );
};
