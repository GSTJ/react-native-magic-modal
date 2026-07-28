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
  swipeDirection: undefined,
} satisfies NewConfigProps;

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
  surface = "mobile",
  title,
}: {
  children: React.ReactNode;
  eyebrow: string;
  surface?: "mobile" | "web";
  title: string;
}) => (
  <dialog
    aria-label={title}
    aria-modal="true"
    className={`mm-package-modal is-${surface}`}
    open
    tabIndex={-1}
  >
    <div aria-hidden="true" className="mm-package-surface-bar">
      {surface === "mobile" ? (
        <>
          <span>9:41</span>
          <i className="mm-package-island" />
          <span>5G</span>
        </>
      ) : (
        <>
          <strong>Release dashboard</strong>
          <code>app.example.com/releases</code>
        </>
      )}
    </div>
    <div className="mm-package-modal-heading">
      <span aria-hidden="true" className="mm-package-spark" />
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
      </div>
    </div>
    {children}
  </dialog>
);

const ScorePrompt = () => {
  const { hide } = useMagicModal<number>();

  return (
    <ModalFrame eyebrow="APP RATING" title="How was your experience?">
      <p>Pick a score. The caller is waiting for this value.</p>
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
    <ModalFrame eyebrow="ANOTHER CALLER" title="Payment needs a review">
      <p>
        This opened above the rating prompt. Close it and the rating promise
        stays pending.
      </p>
      <div className="mm-package-modal-fact">
        <span>STACK POSITION</span>
        <strong>Top entry</strong>
      </div>
      <button
        className="mm-package-modal-primary"
        onClick={() => hide("reviewed")}
        type="button"
      >
        Review later
      </button>
    </ModalFrame>
  );
};

const FeedbackPrompt = () => {
  const { hide } = useMagicModal<string>();

  return (
    <ModalFrame eyebrow="FOLLOW-UP" title="What got in the way?">
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
    <ModalFrame eyebrow="STORE REVIEW" title="Leave a store rating?">
      <p>
        A high score reached this branch without adding state to the screen.
      </p>
      <div className="mm-package-modal-actions">
        <button onClick={() => hide("later")} type="button">
          Maybe later
        </button>
        <button
          className="mm-package-modal-primary"
          onClick={() => hide("open")}
          type="button"
        >
          Open the store
        </button>
      </div>
    </ModalFrame>
  );
};

const ThanksPrompt = ({ detail }: { detail: string }) => {
  const { hide } = useMagicModal<void>();

  return (
    <ModalFrame eyebrow="FLOW COMPLETE" title="Thanks for your time.">
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

const UploadPrompt = ({ progress }: { progress: number }) => {
  const { hide } = useMagicModal<"cancelled" | "done">();
  const complete = progress === 100;

  return (
    <ModalFrame
      eyebrow="LIVE UPDATE"
      surface="web"
      title={complete ? "Upload complete" : "Uploading release"}
    >
      <p>update() replaces the component in the open entry.</p>
      <progress
        aria-label={`Upload progress: ${progress}%`}
        className="mm-package-progress"
        max={100}
        value={progress}
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
    setTimeline((current) => [entry, ...current].slice(0, 6));
  }, []);

  const showTracked: ShowTracked = useCallback(
    <T,>(label: string, component: ModalChildren, config?: NewConfigProps) => {
      const handle = magicModal.show<T>(component, config);
      const entry = { id: handle.modalID, label };

      setActiveEntries((current) => [...current, entry]);
      setTimeline((current) =>
        [{ ...entry, result: "PENDING" }, ...current].slice(0, 6),
      );

      void handle.promise.then((result) => {
        setActiveEntries((current) =>
          current.filter(({ id }) => id !== handle.modalID),
        );
        setTimeline((current) =>
          current.map((item) =>
            item.id === handle.modalID
              ? { ...item, result: describeResult(result) }
              : item,
          ),
        );
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

    await notification.promise;
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

      const ratingResult = await rating.promise;

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
        const feedbackResult = await feedback.promise;

        detail =
          feedbackResult.reason === MagicModalHideReason.INTENTIONAL_HIDE
            ? `Feedback saved: ${feedbackResult.data}.`
            : "The feedback prompt closed.";
      } else {
        const store = showTracked<"later" | "open">(
          "Store prompt",
          StorePrompt,
          modalConfig,
        );
        const storeResult = await store.promise;

        detail =
          storeResult.reason === MagicModalHideReason.INTENTIONAL_HIDE &&
          storeResult.data === "open"
            ? "Store review selected."
            : "Store review skipped.";
      }

      const thanks = showTracked<void>(
        "Thank-you prompt",
        createThanksPrompt(detail),
        modalConfig,
      );
      await thanks.promise;
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
      () => <UploadPrompt progress={8} />,
      modalConfig,
    );
    let resolved = false;

    void handle.promise.then(() => {
      resolved = true;
    });

    await [34, 67, 100].reduce(
      (sequence, progress) =>
        sequence.then(async () => {
          await wait(560);

          if (resolved) {
            return;
          }

          handle.update(() => <UploadPrompt progress={progress} />);
          record({
            id: `update-${handle.modalID}-${progress}`,
            label: "Upload content",
            result: `UPDATED TO ${progress}%`,
          });
        }),
      Promise.resolve(),
    );

    await handle.promise;
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
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const syncDialogs = () => {
      const dialogs = [...root.querySelectorAll<HTMLDialogElement>("dialog")];
      const topDialogIndex = dialogs.length - 1;

      for (const [index, dialog] of dialogs.entries()) {
        const hidden = index !== topDialogIndex;
        dialog.inert = hidden;

        if (hidden) {
          dialog.setAttribute("aria-hidden", "true");
        } else {
          dialog.removeAttribute("aria-hidden");
        }
      }

      dialogs.at(-1)?.focus();
    };

    const dialogObserver = new MutationObserver(syncDialogs);
    dialogObserver.observe(root, { childList: true, subtree: true });

    const focusTopDialog = window.setTimeout(syncDialogs, 30);

    if (!modalOpen && !ratingRunning && !updateRunning) {
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    }

    return () => {
      dialogObserver.disconnect();
      window.clearTimeout(focusTopDialog);
    };
  }, [activeEntries, modalOpen, ratingRunning, updateRunning]);

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const root = rootRef.current;
      const dialogs = root?.querySelectorAll<HTMLElement>("dialog");
      const dialog = dialogs?.item((dialogs?.length ?? 1) - 1);

      if (!dialog) {
        return;
      }

      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ];

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const [first] = focusable;
      const last = focusable.at(-1);

      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
    };
  }, [modalOpen]);

  return (
    <div
      className={`mm-live-package${modalOpen ? " is-modal-open" : ""}`}
      ref={rootRef}
    >
      <div className="mm-live-package-content">
        <div className="mm-package-toolbar">
          <div>
            <span>ACTUAL PACKAGE</span>
            <code>Expo / iOS / Android / Web</code>
          </div>
          <div aria-live="polite" className="mm-package-count">
            <strong>{activeEntries.length}</strong>
            <span>
              {activeEntries.length === 1 ? "open entry" : "open entries"}
            </span>
          </div>
        </div>

        <div className="mm-package-grid">
          <div className="mm-package-copy">
            <span>ONE PORTAL ON THIS PAGE</span>
            <h3>Stack a notification over the rating prompt</h3>
            <p>
              Start the rating flow in the phone frame, or run update() in the
              web panel. This page mounts one MagicModalPortal for both.
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
                {updateRunning ? "Upload in progress" : "Start web upload"}
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
                {"\n  "}.show(RatingPrompt){"\n  "}.promise
              </code>
            </pre>
            <footer>
              <span>1 portal</span>
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
