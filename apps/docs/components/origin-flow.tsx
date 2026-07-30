"use client";

import type { HideReturn } from "react-native-magic-modal";

import type { MouseEvent, PointerEvent } from "react";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ArrowUpRight,
  Battery,
  Check,
  Heart,
  RotateCcw,
  Signal,
  Star,
  Wifi,
} from "lucide-react";
import { MagicModalHideReason } from "react-native-magic-modal";

type Branch = "feedback" | "store" | null;
type FlowStep = "rating" | "feedback" | "store" | "thanks" | "done";
type RatingAnswer = { score: number };
type ResultReason = HideReturn<RatingAnswer>["reason"];

const scoreLabels = ["0", "1", "2", "3", "4", "5"] as const;
const feedbackOptions = [
  "Too many steps",
  "Hard to use",
  "Something else",
] as const;

const stepIndex: Record<FlowStep, number> = {
  rating: 0,
  feedback: 2,
  store: 2,
  thanks: 3,
  done: 4,
};

const activeEntryByStep: Record<FlowStep, string> = {
  rating: "RatingModal",
  feedback: "FeedbackModal",
  store: "StoreReviewModal",
  thanks: "ThanksModal",
  done: "stack empty",
};

const liveCodeByStep: Record<FlowStep, string> = {
  rating: "await show(RatingModal)",
  feedback: "await show(FeedbackModal)",
  store: "await show(StoreReviewModal)",
  thanks: "await show(ThanksModal)",
  done: "return rating.data",
};

const activeCodeClass = (activeIndex: number, lineIndex: number) =>
  activeIndex === lineIndex ? "is-active" : "";

const getBranchSheetClass = (
  branch: Branch,
  expectedBranch: Exclude<Branch, null>,
  step: FlowStep,
) => {
  if (step === expectedBranch) return "is-active";
  if (branch === expectedBranch) return "is-past";
  return "is-future";
};

const getResultCopy = (reason: ResultReason) => {
  if (reason === MagicModalHideReason.INTENTIONAL_HIDE) {
    return {
      label: "RESOLVED",
      message: "The caller received the rating.",
    };
  }

  const interruptedCopy: Record<
    Exclude<ResultReason, MagicModalHideReason.INTENTIONAL_HIDE>,
    { label: string; message: string }
  > = {
    [MagicModalHideReason.BACK_BUTTON_PRESS]: {
      label: "BACK_BUTTON_PRESS",
      message: "The system back action resolved the promise.",
    },
    [MagicModalHideReason.BACKDROP_PRESS]: {
      label: "BACKDROP_PRESS",
      message: "The backdrop press resolved the promise.",
    },
    [MagicModalHideReason.GLOBAL_HIDE_ALL]: {
      label: "GLOBAL_HIDE_ALL",
      message: "hideAll() cleared the stack and resolved every entry.",
    },
    [MagicModalHideReason.SWIPE_COMPLETE]: {
      label: "SWIPE_COMPLETE",
      message: "The completed swipe resolved the promise.",
    },
  };

  return interruptedCopy[reason];
};

const getResultPayload = (
  reason: ResultReason,
  score: number | null,
): string => {
  if (reason === MagicModalHideReason.INTENTIONAL_HIDE && score !== null) {
    return `{\n  reason: MagicModalHideReason.${reason},\n  data: { score: ${score} }\n}`;
  }
  return `{\n  reason: MagicModalHideReason.${reason}\n}`;
};

export const OriginFlow = () => {
  const closingTimer = useRef<number | null>(null);
  const dragDistance = useRef(0);
  const dragHandleRef = useRef<HTMLButtonElement>(null);
  const dragPointerId = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const locked = useRef(false);
  const ratingSheetRef = useRef<HTMLElement>(null);
  const [branch, setBranch] = useState<Branch>(null);
  const [feedback, setFeedback] = useState("Too many steps");
  const [reason, setReason] = useState<ResultReason>(
    MagicModalHideReason.INTENTIONAL_HIDE,
  );
  const [score, setScore] = useState<number | null>(null);
  const [step, setStep] = useState<FlowStep>("rating");

  const clearDrag = useCallback((returnToOrigin = true) => {
    const handle = dragHandleRef.current;
    const pointerId = dragPointerId.current;

    if (handle && pointerId !== null && handle.hasPointerCapture(pointerId)) {
      handle.releasePointerCapture(pointerId);
    }

    dragDistance.current = 0;
    dragPointerId.current = null;
    dragStartY.current = null;

    if (ratingSheetRef.current) {
      delete ratingSheetRef.current.dataset.dragging;
      if (returnToOrigin) {
        ratingSheetRef.current.style.removeProperty("transform");
      }
    }
  }, []);

  const finishRatingDismiss = useCallback(() => {
    if (closingTimer.current !== null) {
      window.clearTimeout(closingTimer.current);
      closingTimer.current = null;
    }

    clearDrag(false);
    ratingSheetRef.current?.style.removeProperty("transform");
    setStep("done");
  }, [clearDrag]);

  const dismissRating = useCallback(
    (
      nextReason:
        | MagicModalHideReason.BACK_BUTTON_PRESS
        | MagicModalHideReason.BACKDROP_PRESS
        | MagicModalHideReason.SWIPE_COMPLETE,
    ) => {
      if (locked.current || step !== "rating") {
        return;
      }

      locked.current = true;
      setReason(nextReason);
      if (ratingSheetRef.current) {
        delete ratingSheetRef.current.dataset.dragging;
        ratingSheetRef.current.style.transform = "translateY(112%)";
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finishRatingDismiss();
        return;
      }

      closingTimer.current = window.setTimeout(finishRatingDismiss, 420);
    },
    [finishRatingDismiss, step],
  );

  const reset = useCallback(() => {
    if (closingTimer.current !== null) {
      window.clearTimeout(closingTimer.current);
      closingTimer.current = null;
    }
    locked.current = false;
    clearDrag();
    setBranch(null);
    setFeedback("Too many steps");
    setReason(MagicModalHideReason.INTENTIONAL_HIDE);
    setScore(null);
    setStep("rating");
  }, [clearDrag]);

  useEffect(
    () => () => {
      if (closingTimer.current !== null) {
        window.clearTimeout(closingTimer.current);
      }
      clearDrag();
    },
    [clearDrag],
  );

  const chooseScore = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (locked.current) {
      return;
    }
    const nextScore = Number(event.currentTarget.dataset.score);
    const nextBranch = nextScore < 4 ? "feedback" : "store";
    setScore(nextScore);
    setBranch(nextBranch);
    setReason(MagicModalHideReason.INTENTIONAL_HIDE);
    setStep(nextBranch);
  }, []);

  const chooseFeedback = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setFeedback(event.currentTarget.dataset.feedback ?? "Something else");
  }, []);

  const finishBranch = useCallback(() => setStep("thanks"), []);
  const finishFlow = useCallback(() => {
    setReason(MagicModalHideReason.INTENTIONAL_HIDE);
    setStep("done");
  }, []);
  const dismissAll = useCallback(() => {
    if (locked.current) {
      return;
    }
    locked.current = true;
    clearDrag();
    setReason(MagicModalHideReason.GLOBAL_HIDE_ALL);
    setStep("done");
  }, [clearDrag]);

  const dismissFromBackdrop = useCallback(
    () => dismissRating(MagicModalHideReason.BACKDROP_PRESS),
    [dismissRating],
  );

  const startSwipe = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (
        locked.current ||
        step !== "rating" ||
        !event.isPrimary ||
        event.button !== 0
      ) {
        return;
      }

      dragPointerId.current = event.pointerId;
      dragStartY.current = event.clientY;
      dragDistance.current = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (ratingSheetRef.current) {
        ratingSheetRef.current.dataset.dragging = "true";
      }
    },
    [step],
  );

  const moveSwipe = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (
      dragStartY.current === null ||
      event.pointerId !== dragPointerId.current ||
      !event.isPrimary
    ) {
      return;
    }

    const distance = Math.max(0, event.clientY - dragStartY.current);
    dragDistance.current = distance;
    ratingSheetRef.current?.style.setProperty(
      "transform",
      `translateY(${Math.min(distance, 190)}px)`,
    );
  }, []);

  const cancelSwipe = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (
        dragPointerId.current !== null &&
        event.pointerId !== dragPointerId.current
      ) {
        return;
      }
      clearDrag();
    },
    [clearDrag],
  );

  const endSwipe = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (
        dragStartY.current === null ||
        event.pointerId !== dragPointerId.current
      ) {
        return;
      }

      const shouldDismiss = dragDistance.current >= 72;
      clearDrag(!shouldDismiss);

      if (shouldDismiss) {
        dismissRating(MagicModalHideReason.SWIPE_COMPLETE);
      }
    },
    [clearDrag, dismissRating],
  );

  const activateSwipeWithKeyboard = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) {
        dismissRating(MagicModalHideReason.SWIPE_COMPLETE);
      }
    },
    [dismissRating],
  );

  useEffect(() => {
    if (step !== "rating") {
      return;
    }

    const dismissOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissRating(MagicModalHideReason.BACK_BUTTON_PRESS);
      }
    };

    document.addEventListener("keydown", dismissOnEscape);
    return () => document.removeEventListener("keydown", dismissOnEscape);
  }, [dismissRating, step]);

  const isInterrupted =
    step === "done" && reason !== MagicModalHideReason.INTENTIONAL_HIDE;
  const activeIndex = isInterrupted ? 1 : stepIndex[step];
  const activeEntry = activeEntryByStep[step];
  const feedbackClass = getBranchSheetClass(branch, "feedback", step);
  const isDone = step === "done";
  const ratingClass = step === "rating" ? "is-active" : "is-past";
  const resultCopy = getResultCopy(reason);
  const resultPayload = getResultPayload(reason, score);
  const storeClass = getBranchSheetClass(branch, "store", step);
  const thanksClass = step === "thanks" ? "is-active" : "is-future";
  const liveCode = isInterrupted
    ? `return { interruptedBy: "${reason}" }`
    : liveCodeByStep[step];

  return (
    <section
      aria-label="Interactive walkthrough of the original rating flow"
      className="mm-origin-flow"
      data-branch={branch ?? "none"}
      data-reason={reason}
      data-step={step}
      id="original-flow"
    >
      <span aria-hidden="true" className="mm-flow-four">
        4
      </span>

      <div className="mm-flow-code" data-parallax="-0.35">
        <div className="mm-flow-code-head">
          <span className="mm-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <code>rating-flow.tsx</code>
        </div>

        <pre className="mm-flow-code-body" aria-label="Rating flow code">
          <code>
            <span
              className={activeCodeClass(activeIndex, 0)}
              data-code-step="01"
            >
              <i>01</i>
              <b>const</b> rating = <b>await</b> magicModal
              {"\n"}
              <i />
              {"  "}.show&lt;RatingAnswer&gt;(RatingModal).promise;
            </span>
            <span
              className={activeCodeClass(activeIndex, 1)}
              data-code-step="02"
            >
              <i>02</i>
              <b>if</b> (rating.reason !=={"\n"}
              <i />
              {"  "}MagicModalHideReason.INTENTIONAL_HIDE) {"{"}
              {"\n"}
              <i />
              {"  "}
              <b>return</b> {"{ interruptedBy: rating.reason }"};{"\n"}
              <i />
              {"}"}
            </span>
            <span
              className={activeCodeClass(activeIndex, 2)}
              data-code-step="03"
            >
              <i>03</i>
              <b>await</b> magicModal.show(
              {"\n"}
              <i />
              {"  "}rating.data.score &lt; 4{"\n"}
              <i />
              {"    "}? FeedbackModal : StoreReviewModal
              {"\n"}
              <i />
              ).promise;
            </span>
            <span
              className={activeCodeClass(activeIndex, 3)}
              data-code-step="04"
            >
              <i>04</i>
              <b>await</b> magicModal
              {"\n"}
              <i />
              {"  "}.show(ThanksModal).promise;
            </span>
            <span
              className={activeCodeClass(activeIndex, 4)}
              data-code-step="05"
            >
              <i>05</i>
              <b>return</b> rating.data;
            </span>
          </code>
        </pre>

        <div className="mm-flow-code-live" aria-hidden="true">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <code>{liveCode}</code>
        </div>

        <div className="mm-flow-promise">
          <span className="mm-flow-promise-dot" />
          <span>{isDone ? "resolved" : "promise pending"}</span>
        </div>
      </div>

      <div className="mm-flow-tether" aria-hidden="true">
        <span />
        <i />
      </div>

      <div className="mm-native-stage" data-parallax="0.22">
        <div className="mm-stage-meta">
          <span>
            <i />
            MagicModalPortal
          </span>
          <code>{isDone ? "STACK: EMPTY" : "STACK: 1 ENTRY"}</code>
        </div>

        <div className="mm-native-surface">
          <div className="mm-native-statusbar">
            <b>9:41</b>
            <span aria-hidden="true">
              <Signal size={8} />
              <Wifi size={8} />
              <Battery size={9} />
            </span>
          </div>
          <div className="mm-native-nav">
            <span>Moments</span>
            <button
              aria-label="Reset the example"
              onClick={reset}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={15} />
            </button>
          </div>

          <div className="mm-feed" aria-hidden="true">
            <div className="mm-feed-author">
              <i>GT</i>
              <span>
                <strong>Gabriel</strong>
                <small>just now</small>
              </span>
            </div>
            <div className="mm-feed-image">
              <span>first like</span>
              <b>
                <Heart aria-hidden="true" fill="currentColor" size={16} />
              </b>
            </div>
            <div className="mm-feed-copy">
              <i />
              <i />
              <i />
            </div>
          </div>

          <button
            aria-hidden={step !== "rating"}
            aria-label="Tap outside the rating prompt to close it"
            className="mm-native-scrim mm-origin-backdrop"
            data-interactive={step === "rating"}
            data-visible={!isDone}
            disabled={step !== "rating"}
            onClick={dismissFromBackdrop}
            tabIndex={step === "rating" ? 0 : -1}
            type="button"
          />

          <div className="mm-sheet-echoes" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>

          <article
            aria-hidden={step !== "rating"}
            className={`mm-native-sheet mm-rating-sheet ${ratingClass}`}
            inert={step !== "rating"}
            ref={ratingSheetRef}
          >
            <button
              aria-describedby="mm-rating-dismiss-hint"
              aria-label="Drag the prompt down or press Enter to close it"
              className="mm-sheet-drag-handle"
              onClick={activateSwipeWithKeyboard}
              onPointerCancel={cancelSwipe}
              onPointerDown={startSwipe}
              onPointerMove={moveSwipe}
              onPointerUp={endSwipe}
              ref={dragHandleRef}
              tabIndex={step === "rating" ? 0 : -1}
              type="button"
            >
              <span aria-hidden="true" className="mm-sheet-handle" />
            </button>
            <div className="mm-sheet-count">
              <span>01</span>
              <code>{activeEntry}</code>
            </div>
            <h2 id="mm-rating-title">Rate the app</h2>
            <p>How would you rate the app from zero to five?</p>
            <fieldset
              aria-label="Choose a rating from zero to five"
              className="mm-rating-options"
            >
              {scoreLabels.map((value) => (
                <button
                  aria-label={`${value} out of 5`}
                  data-score={value}
                  key={value}
                  onClick={chooseScore}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </fieldset>
            <small id="mm-rating-dismiss-hint">
              Drag down or tap outside to close. Scores 0-3 ask for feedback;
              scores 4-5 offer a store review.
            </small>
          </article>

          <article
            aria-hidden={step !== "feedback"}
            className={`mm-native-sheet mm-feedback-sheet ${feedbackClass}`}
            inert={step !== "feedback"}
          >
            <span className="mm-sheet-handle" />
            <div className="mm-sheet-count">
              <span>02A</span>
              <code>score &lt; 4</code>
            </div>
            <h2>What got in the way?</h2>
            <p>Choose the closest reason.</p>
            <div className="mm-feedback-options">
              {feedbackOptions.map((value) => (
                <button
                  aria-pressed={feedback === value}
                  data-feedback={value}
                  key={value}
                  onClick={chooseFeedback}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
            <button
              className="mm-sheet-primary"
              onClick={finishBranch}
              type="button"
            >
              Send feedback
            </button>
          </article>

          <article
            aria-hidden={step !== "store"}
            className={`mm-native-sheet mm-store-sheet ${storeClass}`}
            inert={step !== "store"}
          >
            <span className="mm-sheet-handle" />
            <div className="mm-sheet-count">
              <span>02B</span>
              <code>score &gt;= 4</code>
            </div>
            <div className="mm-store-icon">
              <Star aria-hidden="true" fill="currentColor" size={16} />
            </div>
            <h2>Would you leave a store rating?</h2>
            <p>Scores four and five reach this branch.</p>
            <div className="mm-sheet-actions">
              <button onClick={finishBranch} type="button">
                Not now
              </button>
              <button
                className="mm-sheet-primary"
                onClick={finishBranch}
                type="button"
              >
                Open the store
                <ArrowUpRight aria-hidden="true" size={14} />
              </button>
            </div>
          </article>

          <article
            aria-hidden={step !== "thanks"}
            className={`mm-native-sheet mm-thanks-sheet ${thanksClass}`}
            inert={step !== "thanks"}
          >
            <span className="mm-sheet-handle" />
            <div className="mm-sheet-count">
              <span>03</span>
              <code>last modal</code>
            </div>
            <div className="mm-thanks-mark" aria-hidden="true">
              <Check size={18} />
            </div>
            <h2>Thanks.</h2>
            <p>The last modal closes and the caller resumes.</p>
            <button
              className="mm-sheet-primary"
              onClick={finishFlow}
              type="button"
            >
              Resolve the promise
            </button>
          </article>

          <div
            aria-hidden={!isDone}
            aria-live="polite"
            className={`mm-resolved-card ${isDone ? "is-visible" : ""}`}
            inert={!isDone}
          >
            <span>{resultCopy.label}</span>
            <strong>{resultCopy.message}</strong>
            <pre>
              <code>{resultPayload}</code>
            </pre>
            <button onClick={reset} tabIndex={isDone ? 0 : -1} type="button">
              Run it again
              <RotateCcw aria-hidden="true" size={14} />
            </button>
          </div>
        </div>

        <div className="mm-stage-footer">
          <span>
            <i />
            {activeEntry}
          </span>
          <button disabled={isDone} onClick={dismissAll} type="button">
            hideAll()
          </button>
        </div>
      </div>
    </section>
  );
};
