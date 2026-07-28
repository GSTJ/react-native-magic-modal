import Link from "next/link";

import { ArrowRight, Code2, ExternalLink, MoveRight } from "lucide-react";

import { FeatureLab } from "@/components/feature-lab";
import { InstallCommand } from "@/components/install-command";
import { LegacyAnchorRouter } from "@/components/legacy-anchor-router";
import { MagicMark } from "@/components/magic-mark";
import { ModalPlayground } from "@/components/modal-playground";

const flow = [
  {
    command: "magicModal.show<T>()",
    description:
      "Open the interaction from a screen, effect, service, or plain async function.",
    label: "CALL",
    title: "Open it from where the decision happens.",
  },
  {
    command: "result.promise",
    description:
      "The portal renders the active entry while the caller waits without coordinating global state.",
    label: "WAIT",
    title: "Let the stack own the interaction.",
  },
  {
    command: "result.data",
    description:
      "Confirmation, cancellation, and dismissal return as a discriminated typed result.",
    label: "CONTINUE",
    title: "Pick the flow back up with an answer.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="magic-home-v2" data-home-version="2">
      <LegacyAnchorRouter />

      <header className="mh-nav">
        <Link aria-label="Magic Modal home" className="mh-nav-brand" href="/">
          <MagicMark size={31} />
          <span>Magic Modal</span>
          <code>9.0.1</code>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/docs">Docs</Link>
          <Link href="/docs/guides/recipes">Recipes</Link>
          <a
            href="https://www.npmjs.com/package/react-native-magic-modal"
            rel="noreferrer"
            target="_blank"
          >
            npm
          </a>
          <a
            className="mh-nav-github"
            href="https://github.com/GSTJ/react-native-magic-modal"
            rel="noreferrer"
            target="_blank"
          >
            <Code2 aria-hidden="true" size={15} />
            <span>GitHub</span>
            <ExternalLink aria-hidden="true" size={11} />
          </a>
        </nav>
      </header>

      <section className="mh-hero">
        <div aria-hidden="true" className="mh-contours">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="mh-hero-copy">
          <span className="mh-kicker">
            IMPERATIVE <i>/</i> AWAITABLE <i>/</i> TYPE-SAFE
          </span>
          <h1>
            Open the modal.
            <br />
            <em>Await the answer.</em>
          </h1>
          <p>
            Show any React Native modal from anywhere in your app. Await a typed
            result, then continue exactly where the flow left off.
          </p>
          <div className="mh-hero-actions">
            <Link
              className="mh-primary-action"
              href="/docs/getting-started/installation"
            >
              Build your first flow
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="mh-secondary-action" href="/docs/reference">
              Read the API
            </Link>
          </div>
          <InstallCommand />
        </div>

        <ModalPlayground />
      </section>

      <section aria-label="Project proof" className="mh-proof-rail">
        <a
          href="https://github.com/GSTJ/react-native-magic-modal/stargazers"
          rel="noreferrer"
          target="_blank"
        >
          <strong>600+</strong>
          <span>GitHub stars</span>
        </a>
        <a
          href="https://www.npmjs.com/package/react-native-magic-modal"
          rel="noreferrer"
          target="_blank"
        >
          <strong>80k+</strong>
          <span>downloads last year</span>
        </a>
        <div>
          <strong>1</strong>
          <span>portal at the root</span>
        </div>
        <div>
          <strong>T</strong>
          <span>typed end to end</span>
        </div>
      </section>

      <section className="mh-flow-section">
        <div className="mh-section-heading">
          <span>The flow</span>
          <h2>Show. Wait. Continue.</h2>
          <p>
            Keep the interaction beside the code it unlocks. No callback ladder
            and no navigation detour.
          </p>
        </div>

        <ol className="mh-flow-list">
          {flow.map(({ command, description, label, title }, index) => (
            <li key={label}>
              <div className="mh-flow-index">
                <span>{label}</span>
                <code>{command}</code>
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              {index < flow.length - 1 && (
                <MoveRight aria-hidden="true" size={18} />
              )}
            </li>
          ))}
        </ol>
      </section>

      <FeatureLab />

      <section className="mh-mechanism">
        <div className="mh-section-heading">
          <span>One root</span>
          <h2>The portal stays. The stack moves.</h2>
          <p>
            Mount one rendering boundary near the app root. Every call pushes an
            entry there; every hide removes one and resolves its caller.
          </p>
        </div>

        <div className="mh-mechanism-map">
          <div className="mh-call-sites">
            <span>CALL SITES</span>
            <code>navigation.ts</code>
            <code>checkout.tsx</code>
            <code>session.ts</code>
          </div>
          <div aria-hidden="true" className="mh-mechanism-line">
            <span>show()</span>
            <i />
          </div>
          <div className="mh-portal-node">
            <span>APP ROOT</span>
            <strong>MagicModalPortal</strong>
            <div aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div aria-hidden="true" className="mh-mechanism-line is-return">
            <i />
            <span>resolve()</span>
          </div>
          <div className="mh-result-node">
            <span>CALLER RESUMES</span>
            <code>
              {"{ reason,"}
              <br />
              {"  data }"}
            </code>
          </div>
        </div>
      </section>

      <section className="mh-final-cta">
        <div>
          <span>READY WHEN THE FLOW IS</span>
          <h2>One portal. Then every modal is a call.</h2>
          <p>
            Install Magic Modal and build the first interaction you can await.
          </p>
        </div>
        <div>
          <Link
            className="mh-primary-action"
            href="/docs/getting-started/setup"
          >
            Set up the portal
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
          <InstallCommand compact />
        </div>
      </section>

      <footer className="mh-footer">
        <Link className="mh-nav-brand" href="/">
          <MagicMark size={25} />
          <span>Magic Modal</span>
        </Link>
        <span>MIT · built in the open by GSTJ</span>
        <a href="https://github.com/GSTJ/react-native-magic-modal">
          Source
          <ExternalLink aria-hidden="true" size={11} />
        </a>
      </footer>
    </main>
  );
}
