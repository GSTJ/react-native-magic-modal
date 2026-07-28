"use client";

import type { KeyboardEvent, RefObject } from "react";

import { useCallback, useRef, useState } from "react";

import { Check, Layers3, RotateCcw, X } from "lucide-react";

type Result = "waiting" | "confirmed" | "dismissed";

const focusSoon = (target: RefObject<HTMLButtonElement | null>) => {
  requestAnimationFrame(() => target.current?.focus());
};

export const ModalPlayground = () => {
  const [depth, setDepth] = useState(1);
  const [result, setResult] = useState<Result>("waiting");
  const launchButton = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const stackedButton = useRef<HTMLButtonElement>(null);

  const show = useCallback(() => {
    setDepth(1);
    setResult("waiting");
    focusSoon(confirmButton);
  }, []);

  const finish = useCallback((next: Exclude<Result, "waiting">) => {
    setDepth(0);
    setResult(next);
    focusSoon(launchButton);
  }, []);

  const confirm = useCallback(() => finish("confirmed"), [finish]);
  const dismiss = useCallback(() => finish("dismissed"), [finish]);

  const showSecond = useCallback(() => {
    setDepth(2);
    focusSoon(stackedButton);
  }, []);

  const closeSecond = useCallback(() => {
    setDepth(1);
    focusSoon(confirmButton);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDialogElement>) => {
      if (event.key !== "Escape" || depth === 0) return;

      event.preventDefault();
      if (depth === 2) {
        closeSecond();
      } else {
        dismiss();
      }
    },
    [closeSecond, depth, dismiss],
  );

  let status = "Promise waiting for the modal.";
  if (result === "confirmed") {
    status = "Resolved with confirmed true.";
  } else if (result === "dismissed") {
    status = "Resolved with dismissal reason GLOBAL_HIDE_ALL.";
  } else if (depth === 2) {
    status =
      "Two entries in the modal stack. The first promise is still waiting.";
  }

  return (
    <section
      aria-label="Interactive modal lifecycle demo"
      className={`mh-runtime mh-runtime-${result}`}
    >
      <div className="mh-runtime-toolbar">
        <div>
          <Layers3 aria-hidden="true" size={15} />
          <span>magic runtime</span>
        </div>
        <div className="mh-runtime-state">
          <i />
          {depth > 0 ? `stack 0${depth}` : "stack empty"}
        </div>
      </div>

      <div className="mh-runtime-grid">
        <div className="mh-runtime-code">
          <span className="mh-runtime-caption">THE CALL SITE</span>
          <pre aria-label="TypeScript example">
            <code>
              <span className="mh-code-dim">&#47;&#47; checkout-flow.tsx</span>
              {"\n"}
              <span className="mh-code-keyword">const</span> result{" "}
              <span className="mh-code-keyword">= await</span>
              {"\n  "}
              magicModal.<span className="mh-code-call">show</span>
              <span className="mh-code-type">&lt;Confirmation&gt;</span>
              {"(\n    ConfirmPurchase,\n"}
              {"  ).promise;\n\n"}
              <span className="mh-code-keyword">if</span> (result.reason ===
              {"\n  "}
              <span className="mh-code-enum">
                MagicModalHideReason.INTENTIONAL_HIDE
              </span>
              {") {\n  "}
              completeOrder(result.data);
              {"\n}"}
            </code>
          </pre>

          <div className="mh-runtime-events" aria-hidden="true">
            <div className={depth > 0 ? "is-active" : ""}>
              <span>CALL</span>
              <code>show()</code>
            </div>
            <div className={depth > 0 ? "is-active" : ""}>
              <span>PORTAL</span>
              <code>{depth > 0 ? `#a71f · depth ${depth}` : "idle"}</code>
            </div>
            <div className={result === "waiting" ? "is-active" : "is-resolved"}>
              <span>PROMISE</span>
              <code>{result === "waiting" ? "pending" : "resolved"}</code>
            </div>
          </div>

          <p aria-live="polite" className="mh-runtime-output">
            <span className={`mh-output-dot is-${result}`} />
            {status}
          </p>
        </div>

        <div className="mh-runtime-stage">
          <span className="mh-runtime-caption">THE PORTAL</span>
          <div className="mh-app-surface">
            <div className="mh-app-topbar">
              <span>Checkout</span>
              <code>cart / 01</code>
            </div>
            <div className="mh-app-content" aria-hidden="true">
              <div className="mh-app-product">
                <i>M</i>
                <div>
                  <strong>Magic Pass</strong>
                  <span>Lifetime access</span>
                </div>
                <b>$24</b>
              </div>
              <div className="mh-app-row" />
              <div className="mh-app-row is-short" />
            </div>

            <div
              aria-hidden={depth === 0}
              className={`mh-stage-backdrop ${depth > 0 ? "is-open" : ""}`}
              inert={depth === 0}
            >
              <button
                aria-label="Dismiss every demo modal"
                className="mh-stage-dismiss"
                onClick={dismiss}
                type="button"
              />
              <dialog
                aria-hidden={depth === 2}
                aria-labelledby="mh-confirm-title"
                className="mh-demo-sheet"
                inert={depth === 2}
                onKeyDown={handleKeyDown}
                open={depth > 0}
              >
                <button
                  aria-label="Dismiss confirmation"
                  className="mh-sheet-close"
                  onClick={dismiss}
                  type="button"
                >
                  <X aria-hidden="true" size={14} />
                </button>
                <div className="mh-sheet-icon">
                  <Check aria-hidden="true" size={19} />
                </div>
                <strong id="mh-confirm-title">Confirm purchase?</strong>
                <p>The caller stays paused until this interaction resolves.</p>
                <div className="mh-sheet-actions">
                  <button onClick={showSecond} type="button">
                    Stack another
                  </button>
                  <button onClick={confirm} ref={confirmButton} type="button">
                    Confirm · $24
                  </button>
                </div>
              </dialog>

              <dialog
                aria-labelledby="mh-stack-title"
                className={`mh-demo-alert ${depth === 2 ? "is-open" : ""}`}
                onKeyDown={handleKeyDown}
                open={depth === 2}
              >
                <code>#c240 · stack 02</code>
                <strong id="mh-stack-title">Still there underneath.</strong>
                <p>
                  Close this entry and the first modal keeps its promise and
                  position.
                </p>
                <button onClick={closeSecond} ref={stackedButton} type="button">
                  Return to #a71f
                </button>
              </dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="mh-runtime-controls">
        <button onClick={show} ref={launchButton} type="button">
          <RotateCcw aria-hidden="true" size={14} />
          Run show()
        </button>
        <button disabled={depth !== 1} onClick={showSecond} type="button">
          Stack another
        </button>
        <button disabled={depth === 0} onClick={dismiss} type="button">
          hideAll()
        </button>
        <span>Try the flow · press Esc to pop the active entry</span>
      </div>
    </section>
  );
};
