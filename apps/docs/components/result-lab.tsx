"use client";

import type { HideReturn } from "react-native-magic-modal";

import type { AnimationEvent, MouseEvent, PointerEvent } from "react";

import { useCallback, useEffect, useRef, useState } from "react";

import { MagicModalHideReason } from "react-native-magic-modal";

import { SyntaxCode } from "@/components/syntax-code";

type Answer = { answer: number };
type CloseReason = HideReturn<Answer>["reason"];
type LabPhase = "pending" | "resolved";
type VisualPhase = "closed" | "closing" | "open";

const outcomes: {
  ariaLabel: string;
  reason: CloseReason;
  short: string;
  trigger: string;
}[] = [
  {
    ariaLabel: "Resolve with answer 42",
    reason: MagicModalHideReason.INTENTIONAL_HIDE,
    short: "answer 42",
    trigger: "hide({ answer: 42 })",
  },
  {
    ariaLabel: "Close by pressing the backdrop",
    reason: MagicModalHideReason.BACKDROP_PRESS,
    short: "tap backdrop",
    trigger: "tap the live backdrop",
  },
  {
    ariaLabel: "Close by swiping down",
    reason: MagicModalHideReason.SWIPE_COMPLETE,
    short: "swipe down",
    trigger: "complete the swipe",
  },
  {
    ariaLabel: "Simulate the Android back button",
    reason: MagicModalHideReason.BACK_BUTTON_PRESS,
    short: "simulate Android back",
    trigger: "simulate BACK_BUTTON_PRESS on the web",
  },
  {
    ariaLabel: "Close every modal with hideAll",
    reason: MagicModalHideReason.GLOBAL_HIDE_ALL,
    short: "run hideAll()",
    trigger: "magicModal.hideAll()",
  },
];

const triggerByReason = Object.fromEntries(
  outcomes.map(({ reason, trigger }) => [reason, trigger]),
) as Record<CloseReason, string>;

const createResult = (reason: CloseReason): HideReturn<Answer> =>
  reason === MagicModalHideReason.INTENTIONAL_HIDE
    ? { data: { answer: 42 }, reason }
    : { reason };

const pendingCode = {
  closing: "const result = await handle;\n// waiting for the close animation",
  open: "const result = await handle;\n// waiting for a close",
} as const;

const formatResultCode = (result: HideReturn<Answer>) => {
  const data =
    result.reason === MagicModalHideReason.INTENTIONAL_HIDE
      ? `,\n  data: { answer: ${result.data.answer} }`
      : "";

  return `{\n  reason: MagicModalHideReason.${result.reason}${data}\n}`;
};

export const ResultLab = () => {
  const closingTimer = useRef<number | null>(null);
  const closingReason = useRef<CloseReason | null>(null);
  const dragDistance = useRef(0);
  const dragStartY = useRef<number | null>(null);
  const locked = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<LabPhase>("pending");
  const [result, setResult] = useState<HideReturn<Answer> | null>(null);
  const [selectedReason, setSelectedReason] = useState<CloseReason | null>(
    null,
  );
  const [visualPhase, setVisualPhase] = useState<VisualPhase>("open");
  const hasData = result?.reason === MagicModalHideReason.INTENTIONAL_HIDE;
  const controlsLocked = visualPhase !== "open";

  const finishClose = useCallback(() => {
    const reason = closingReason.current;

    if (reason === null) {
      return;
    }

    closingReason.current = null;

    if (closingTimer.current !== null) {
      window.clearTimeout(closingTimer.current);
      closingTimer.current = null;
    }

    setResult(createResult(reason));
    setPhase("resolved");

    dragDistance.current = 0;
    dragStartY.current = null;
    if (sheetRef.current) {
      delete sheetRef.current.dataset.dragging;
    }
    sheetRef.current?.style.removeProperty("--mm-result-drag-y");
    setVisualPhase("closed");
  }, []);

  const resolve = useCallback(
    (nextReason: CloseReason) => {
      if (locked.current) {
        return;
      }

      locked.current = true;
      closingReason.current = nextReason;
      setSelectedReason(nextReason);
      setVisualPhase("closing");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finishClose();
        return;
      }

      closingTimer.current = window.setTimeout(finishClose, 500);
    },
    [finishClose],
  );

  const finishFromAnimation = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (event.currentTarget === event.target) {
        finishClose();
      }
    },
    [finishClose],
  );

  const startSwipe = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (locked.current || !event.isPrimary || event.button !== 0) {
      return;
    }

    dragStartY.current = event.clientY;
    dragDistance.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (sheetRef.current) {
      sheetRef.current.dataset.dragging = "true";
    }
  }, []);

  const moveSwipe = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (dragStartY.current === null || !event.isPrimary) {
      return;
    }

    const distance = Math.max(0, event.clientY - dragStartY.current);
    dragDistance.current = distance;
    sheetRef.current?.style.setProperty(
      "--mm-result-drag-y",
      `${Math.min(distance, 180)}px`,
    );
  }, []);

  const cancelSwipe = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    dragStartY.current = null;
    dragDistance.current = 0;
    if (sheetRef.current) {
      delete sheetRef.current.dataset.dragging;
    }
    sheetRef.current?.style.setProperty("--mm-result-drag-y", "0px");

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const endSwipe = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (dragStartY.current === null) {
        return;
      }

      const shouldClose = dragDistance.current >= 72;
      dragStartY.current = null;
      dragDistance.current = 0;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (shouldClose) {
        resolve(MagicModalHideReason.SWIPE_COMPLETE);
        return;
      }

      if (sheetRef.current) {
        delete sheetRef.current.dataset.dragging;
      }
      sheetRef.current?.style.setProperty("--mm-result-drag-y", "0px");
    },
    [resolve],
  );

  const activateSwipeWithKeyboard = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) {
        resolve(MagicModalHideReason.SWIPE_COMPLETE);
      }
    },
    [resolve],
  );

  const selectReason = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      resolve(event.currentTarget.dataset.reason as CloseReason);
    },
    [resolve],
  );
  const answer = useCallback(
    () => resolve(MagicModalHideReason.INTENTIONAL_HIDE),
    [resolve],
  );
  const closeFromBackdrop = useCallback(
    () => resolve(MagicModalHideReason.BACKDROP_PRESS),
    [resolve],
  );
  const reset = useCallback(() => {
    if (closingTimer.current !== null) {
      window.clearTimeout(closingTimer.current);
      closingTimer.current = null;
    }
    locked.current = false;
    closingReason.current = null;
    dragDistance.current = 0;
    dragStartY.current = null;
    if (sheetRef.current) {
      delete sheetRef.current.dataset.dragging;
    }
    sheetRef.current?.style.removeProperty("--mm-result-drag-y");
    setResult(null);
    setSelectedReason(null);
    setPhase("pending");
    setVisualPhase("open");
  }, []);

  useEffect(
    () => () => {
      if (closingTimer.current !== null) {
        window.clearTimeout(closingTimer.current);
      }
    },
    [],
  );

  let receiptState = "promise pending";
  if (phase === "resolved") {
    receiptState = hasData ? "with data" : "reason only";
  }

  let controlsLabel = "Test a close action";
  if (visualPhase === "closing") {
    controlsLabel = "Modal closing";
  }
  if (phase === "resolved") {
    controlsLabel = "Promise resolved";
  }

  return (
    <div
      className="mm-result-lab"
      data-phase={phase}
      data-reason={selectedReason ?? "pending"}
      data-visual={visualPhase}
    >
      <div className="mm-result-controls">
        <span>{controlsLabel}</span>
        <fieldset aria-label="Choose how the modal closes">
          {outcomes.map((outcome) => (
            <button
              aria-label={outcome.ariaLabel}
              aria-pressed={selectedReason === outcome.reason}
              data-reason={outcome.reason}
              disabled={controlsLocked}
              key={outcome.reason}
              onClick={selectReason}
              type="button"
            >
              <i />
              {outcome.short}
            </button>
          ))}
        </fieldset>
      </div>

      <div className="mm-result-visual">
        <button
          aria-label="Close the modal by pressing its backdrop"
          className="mm-result-backdrop"
          disabled={controlsLocked}
          onClick={closeFromBackdrop}
          type="button"
        >
          backdrop
        </button>
        <div
          className="mm-result-sheet"
          onAnimationEnd={finishFromAnimation}
          ref={sheetRef}
        >
          {visualPhase === "closed" ? (
            <div className="mm-result-closed">
              <strong>Modal closed</strong>
              <span>
                The promise resolved. Restart here to test another path.
              </span>
              <button className="mm-result-reset" onClick={reset} type="button">
                Restart flow
              </button>
            </div>
          ) : (
            <>
              <button
                aria-label="Close the modal with a swipe"
                className="mm-result-drag-handle"
                disabled={controlsLocked}
                onClick={activateSwipeWithKeyboard}
                onPointerCancel={cancelSwipe}
                onPointerDown={startSwipe}
                onPointerMove={moveSwipe}
                onPointerUp={endSwipe}
                type="button"
              >
                <span />
              </button>
              <strong>Choose an answer</strong>
              <p>
                Answer here, tap the backdrop, swipe down, or use a close action
                above.
              </p>
              <button disabled={controlsLocked} onClick={answer} type="button">
                Answer 42
              </button>
            </>
          )}
        </div>
        <div className="mm-result-path" aria-hidden="true">
          <span />
          <i />
        </div>
        <div className="mm-result-receipt" aria-live="polite">
          <div>
            <span>HideReturn&lt;Answer&gt;</span>
            <code>{receiptState}</code>
          </div>
          {phase === "resolved" && result ? (
            <pre aria-label="Resolved promise result" key={selectedReason}>
              <SyntaxCode code={formatResultCode(result)} language="ts" />
            </pre>
          ) : (
            <pre aria-label="Pending promise source code">
              <SyntaxCode
                code={
                  visualPhase === "closing"
                    ? pendingCode.closing
                    : pendingCode.open
                }
                language="ts"
              />
            </pre>
          )}
          <small>
            {phase === "pending" &&
              visualPhase === "open" &&
              "Press one action to resolve the promise"}
            {phase === "pending" &&
              visualPhase === "closing" &&
              "The promise resolves when the close animation finishes."}
            {phase === "resolved" &&
              selectedReason &&
              triggerByReason[selectedReason]}
          </small>
        </div>
      </div>
    </div>
  );
};
