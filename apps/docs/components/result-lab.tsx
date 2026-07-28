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
    trigger: "tap the backdrop",
  },
  {
    reason: "SWIPE_COMPLETE",
    short: "swipe",
    trigger: "complete the swipe",
  },
  {
    reason: "BACK_BUTTON_PRESS",
    short: "Android back",
    trigger: "press system back",
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
  const [reason, setReason] = useState<CloseReason>("INTENTIONAL_HIDE");
  const hasData = reason === "INTENTIONAL_HIDE";
  const selectReason = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setReason(event.currentTarget.dataset.reason as CloseReason);
  }, []);

  return (
    <div className="mm-result-lab" data-reason={reason}>
      <div className="mm-result-controls">
        <span>One modal, five close results</span>
        <fieldset aria-label="Choose a modal close path">
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
        <div className="mm-result-sheet" aria-hidden="true">
          <span />
          <strong>Choose an answer</strong>
          <p>Pick an answer or dismiss the sheet.</p>
          <button tabIndex={-1} type="button">
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
            <code>{hasData ? "with data" : "reason only"}</code>
          </div>
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
          <small>{triggerByReason[reason]}</small>
        </div>
      </div>
    </div>
  );
};
