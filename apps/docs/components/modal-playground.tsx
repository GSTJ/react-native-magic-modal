"use client";

import { useCallback, useState } from "react";

import { Check, ChevronRight, Sparkles, X } from "lucide-react";

export const ModalPlayground = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [result, setResult] = useState<"waiting" | "confirmed" | "cancelled">(
    "waiting",
  );

  const show = useCallback(() => {
    setResult("waiting");
    setIsOpen(true);
  }, []);

  const finish = useCallback((next: "confirmed" | "cancelled") => {
    setResult(next);
    setIsOpen(false);
  }, []);

  const cancel = useCallback(() => finish("cancelled"), [finish]);
  const confirm = useCallback(() => finish("confirmed"), [finish]);

  return (
    <div className="playground-shell">
      <div className="playground-toolbar">
        <div className="traffic-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>checkout-flow.tsx</span>
        <span className="playground-live">
          <i />
          live
        </span>
      </div>

      <div className="playground-grid">
        <div className="code-panel" aria-label="Example TypeScript code">
          <div>
            <span className="code-purple">const</span> result{" "}
            <span className="code-purple">= await</span>
          </div>
          <div className="code-indent">
            magicModal.<span className="code-green">show</span>
            <span className="code-muted">&lt;Confirmation&gt;</span>(
          </div>
          <div className="code-indent-2">
            () <span className="code-purple">=&gt;</span> &lt;
            <span className="code-blue">ConfirmPurchase</span> /&gt;
          </div>
          <div className="code-indent">).promise;</div>
          <div className="code-spacer" />
          <div>
            <span className="code-purple">if</span> (result.reason ===
          </div>
          <div className="code-indent">
            <span className="code-blue">
              MagicModalHideReason.INTENTIONAL_HIDE
            </span>
            ) {"{"}
          </div>
          <div className="code-indent">
            <span className="code-green">completeOrder</span>(result.data);
          </div>
          <div>{"}"}</div>

          <div className="promise-status">
            <span className={`status-dot status-${result}`} />
            {result === "waiting" && "Promise waiting for the modal…"}
            {result === "confirmed" && "Resolved with { confirmed: true }"}
            {result === "cancelled" && "Resolved with BACKDROP_PRESS"}
          </div>
        </div>

        <div className="phone-stage">
          <div className="phone">
            <div className="phone-island" />
            <div className="phone-header">
              <Sparkles size={16} />
              Magic Shop
            </div>
            <div className="product-card">
              <div className="product-orb">M</div>
              <div>
                <strong>Magic Pass</strong>
                <span>$24 / lifetime</span>
              </div>
            </div>
            <button className="show-button" onClick={show} type="button">
              Show modal
              <ChevronRight size={16} />
            </button>

            <div
              aria-hidden={!isOpen}
              className={`phone-backdrop ${isOpen ? "is-open" : ""}`}
              inert={!isOpen}
            >
              <button
                aria-label="Dismiss modal"
                className="phone-backdrop-dismiss"
                onClick={cancel}
                type="button"
              />
              <dialog
                aria-labelledby="demo-modal-title"
                aria-modal="true"
                className="demo-modal"
                open
              >
                <button
                  aria-label="Close modal"
                  className="modal-close"
                  onClick={cancel}
                  type="button"
                >
                  <X size={15} />
                </button>
                <div className="modal-icon">
                  <Check size={20} />
                </div>
                <strong id="demo-modal-title">Confirm purchase?</strong>
                <p>Your modal can return fully typed data to the caller.</p>
                <button onClick={confirm} type="button">
                  Confirm · $24
                </button>
              </dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
