import { ArrowDown, MoveRight } from "lucide-react";

export const FeatureLab = () => (
  <section className="mh-lab" id="proof">
    <div className="mh-section-heading">
      <span>Proof, not promises</span>
      <h2>A small API for the parts modal demos usually skip.</h2>
      <p>
        The stack, result type, updates, and native surface stay explicit. Each
        flow gets the control it needs without becoming app-wide state.
      </p>
    </div>

    <div className="mh-bento">
      <article className="mh-proof-card mh-proof-await">
        <div className="mh-card-label">
          <span>RETURN</span>
          <code>HideReturn&lt;T&gt;</code>
        </div>
        <h3>Return data, not callback wiring.</h3>
        <p>
          The type passed to <code>show&lt;T&gt;()</code> follows the
          interaction back to the awaiting caller.
        </p>
        <div aria-hidden="true" className="mh-result-object">
          <span className="mh-result-brace">{"{"}</span>
          <div>
            <span>
              reason <i>INTENTIONAL_HIDE</i>
            </span>
            <span>
              data <i>{"{ confirmed: true }"}</i>
            </span>
          </div>
          <span className="mh-result-brace">{"}"}</span>
        </div>
      </article>

      <article className="mh-proof-card mh-proof-stack">
        <div className="mh-card-label">
          <span>STACK</span>
          <code>modalID</code>
        </div>
        <h3>Every modal keeps its place.</h3>
        <p>
          Target one entry, update it in place, or clear the deck without
          disturbing another promise.
        </p>
        <div aria-hidden="true" className="mh-stack-diagram">
          <div>
            <code>#e992</code>
            <span>address</span>
          </div>
          <div>
            <code>#c240</code>
            <span>terms</span>
          </div>
          <div>
            <code>#a71f</code>
            <span>checkout</span>
          </div>
        </div>
      </article>

      <article className="mh-proof-card mh-proof-update">
        <div className="mh-card-label">
          <span>UPDATE</span>
          <code>result.update()</code>
        </div>
        <h3>Change the content. Keep the flow.</h3>
        <p>
          Move a multi-step interaction forward without replacing its stack
          position or promise.
        </p>
        <div aria-hidden="true" className="mh-update-diagram">
          <div>
            <small>STEP 01</small>
            <strong>Shipping</strong>
          </div>
          <MoveRight size={18} />
          <div>
            <small>STEP 02</small>
            <strong>Payment</strong>
          </div>
          <span>same #a71f · same promise</span>
        </div>
      </article>

      <article className="mh-proof-card mh-proof-motion">
        <div className="mh-card-label">
          <span>DEVICE</span>
          <code>swipeDirection</code>
        </div>
        <h3>Motion that belongs in the app.</h3>
        <p>
          Tune directional gestures, thresholds, backdrops, and the iOS
          full-window overlay.
        </p>
        <div aria-hidden="true" className="mh-motion-diagram">
          <span>swipe</span>
          <div>
            <ArrowDown size={23} />
          </div>
          <code>velocity &gt; 500</code>
          <i>FullWindowOverlay</i>
        </div>
      </article>
    </div>
  </section>
);
