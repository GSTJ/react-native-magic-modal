"use client";

import type { MouseEvent } from "react";

import { useCallback, useState } from "react";

type CloseReason =
  | "BACKDROP_PRESS"
  | "BACK_BUTTON_PRESS"
  | "GLOBAL_HIDE_ALL"
  | "INTENTIONAL_HIDE"
  | "SWIPE_COMPLETE";

const outcomes: {
  reason: CloseReason;
  short: string;
  trigger: string;
}[] = [
  {
    reason: "INTENTIONAL_HIDE",
    short: "answer",
    trigger: "hide({ answer: 42 })",
  },
  {
    reason: "BACKDROP_PRESS",
    short: "backdrop",
    trigger: "tap the live backdrop",
  },
  {
    reason: "SWIPE_COMPLETE",
    short: "swipe",
    trigger: "complete the swipe",
  },
  {
    reason: "BACK_BUTTON_PRESS",
    short: "Android back",
    trigger: "simulate the Android system back action",
  },
  {
    reason: "GLOBAL_HIDE_ALL",
    short: "hideAll",
    trigger: "magicModal.hideAll()",
  },
];

const triggerByReason = Object.fromEntries(
  outcomes.map(({ reason, trigger }) => [reason, trigger]),
) as Record<CloseReason, string>;

export const ResultLab = () => {
  const [reason, setReason] = useState<CloseReason | null>(null);
  const hasData = reason === "INTENTIONAL_HIDE";
  const selectReason = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setReason(event.currentTarget.dataset.reason as CloseReason);
  }, []);
  const answer = useCallback(() => setReason("INTENTIONAL_HIDE"), []);
  const closeFromBackdrop = useCallback(() => setReason("BACKDROP_PRESS"), []);
  let receiptState = "promise pending";
  if (reason !== null) {
    receiptState = hasData ? "with data" : "reason only";
  }

  return (
    <div className="mm-result-lab" data-reason={reason ?? "pending"}>
      <div className="mm-result-controls">
        <span>Trigger any close path</span>
        <fieldset aria-label="Trigger a modal close path">
          {outcomes.map((outcome) => (
            <button
              aria-pressed={reason === outcome.reason}
              data-reason={outcome.reason}
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
          onClick={closeFromBackdrop}
          type="button"
        >
          tap backdrop
        </button>
        <div className="mm-result-sheet">
          <span />
          <strong>Choose an answer</strong>
          <p>Answer from the sheet or dismiss it another way.</p>
          <button onClick={answer} type="button">
            Answer 42
          </button>
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
          {reason === null ? (
            <pre>
              <code>
                {"const result = await handle.promise;\n// waiting for a close"}
              </code>
            </pre>
          ) : (
            <pre key={reason}>
              <code>
                <span>{"{"}</span>
                {"\n  reason: "}
                <b>MagicModalHideReason.</b>
                <mark>{reason}</mark>
                {hasData && (
                  <>
                    {",\n  data: "}
                    <em>{"{ answer: 42 }"}</em>
                  </>
                )}
                {"\n"}
                <span>{"}"}</span>
              </code>
            </pre>
          )}
          <small>
            {reason === null
              ? "Press an action to resolve the promise"
              : triggerByReason[reason]}
          </small>
        </div>
      </div>
    </div>
  );
};
