import Link from "next/link";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
} from "lucide-react";

import { HomeEffects } from "@/components/home-effects";
import { InstallCommand } from "@/components/install-command";
import { LegacyAnchorRouter } from "@/components/legacy-anchor-router";
import { MagicMark } from "@/components/magic-mark";
import { OriginFlow } from "@/components/origin-flow";
import { PracticalExamples } from "@/components/practical-examples";
import { ResultLab } from "@/components/result-lab";

const history = [
  {
    date: "21 FEB 2022",
    href: "https://github.com/GSTJ/react-native-magic-modal/commit/64612c8",
    title: "First release.",
    year: "2022",
    description:
      "show() moved visibility state out of the screen and returned a value when the modal closed.",
  },
  {
    date: "08 JUN 2024",
    href: "https://github.com/GSTJ/react-native-magic-modal/pull/81",
    title: "Stacks and typed close reasons.",
    year: "2024",
    description:
      "Each entry gained its own ID and promise. This release also added hideAll(), swipe gestures, and the iOS full-window overlay.",
  },
  {
    date: "27 JUL 2026",
    href: "https://github.com/GSTJ/react-native-magic-modal/releases/tag/magic-modal-9.0.0",
    title: "Updates and Gesture Handler 3.",
    year: "2026",
    description:
      "update() can replace an open modal in place. Swipe dismissal now supports Gesture Handler 2 and 3.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="magic-home" data-home-version="3" data-magic-home>
      <LegacyAnchorRouter />
      <HomeEffects />

      <header className="mm-nav">
        <Link aria-label="Magic Modal home" className="mm-brand" href="/">
          <MagicMark size={34} />
          <span>Magic Modal</span>
          <code>9.0.1</code>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#story">Story</a>
          <Link href="/docs/getting-started/setup">Setup</Link>
          <Link href="/docs/reference">API</Link>
          <a
            aria-label="Magic Modal on GitHub"
            className="mm-nav-github"
            href="https://github.com/GSTJ/react-native-magic-modal"
            rel="noreferrer"
            target="_blank"
          >
            <Code2 aria-hidden="true" size={16} />
            <span>GitHub</span>
          </a>
        </nav>
      </header>

      <section className="mm-hero" id="story">
        <div className="mm-hero-copy">
          <p className="mm-overline">
            <span />
            Imperative modals for React Native
          </p>
          <h1>
            Open a modal.
            <br />
            Await the <em>result.</em>
          </h1>
          <p className="mm-hero-lede">
            Mount <code>MagicModalPortal</code> near the app root.{" "}
            <code>show()</code> can run from any async flow and returns a typed
            close result.
          </p>
          <div className="mm-hero-actions">
            <a className="mm-run-link" href="#original-flow">
              Try the original demo
              <ArrowRight aria-hidden="true" size={17} />
            </a>
            <a
              className="mm-article-link"
              href="https://dev.to/gabrieltaveira/you-have-been-using-react-native-modals-wrong-7hd"
              rel="noreferrer"
              target="_blank"
            >
              <BookOpen aria-hidden="true" size={15} />
              Why it was built
              <ArrowUpRight aria-hidden="true" size={13} />
            </a>
          </div>
          <InstallCommand />
        </div>

        <OriginFlow />

        <a
          aria-label="Continue to the origin story"
          className="mm-scroll-cue"
          href="#request"
        >
          <span>The first use case</span>
          <ArrowDown aria-hidden="true" size={15} />
        </a>
      </section>

      <aside aria-label="Project activity" className="mm-proof">
        <a
          href="https://github.com/GSTJ/react-native-magic-modal"
          rel="noreferrer"
          target="_blank"
        >
          <strong>600+</strong>
          <span>GitHub stars</span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
        <a
          href="https://www.npmjs.com/package/react-native-magic-modal"
          rel="noreferrer"
          target="_blank"
        >
          <strong>3,950</strong>
          <span>downloads last week</span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
        <a
          href="https://github.com/GSTJ/react-native-magic-modal/releases/tag/magic-modal-9.0.1"
          rel="noreferrer"
          target="_blank"
        >
          <strong>v9.0.1</strong>
          <span>current release</span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
        <a
          href="https://github.com/GSTJ/react-native-magic-modal/blob/main/LICENSE"
          rel="noreferrer"
          target="_blank"
        >
          <strong>MIT</strong>
          <span>open source since 2022</span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      </aside>

      <section className="mm-request" id="request">
        <div className="mm-request-index" data-reveal>
          <span>THE REQUEST</span>
          <strong>01</strong>
        </div>
        <div className="mm-request-copy" data-reveal>
          <p>
            The first use case was an app-rating flow. After the first like, ask
            for a score. Scores below four open feedback; four or five opens a
            store review. Both paths end with a thank-you.
          </p>
          <aside>
            <span>More callers</span>
            <p>
              The flow later ran after likes anywhere in the app, including
              callers outside the current screen.
            </p>
          </aside>
        </div>
        <div aria-hidden="true" className="mm-request-flags" data-reveal>
          <code>isRatingOpen</code>
          <code>isFeedbackOpen</code>
          <code>isStoreReviewOpen</code>
          <code>isThanksOpen</code>
          <span>four booleans, plus branching and cleanup</span>
        </div>
      </section>

      <PracticalExamples />

      <section className="mm-owner">
        <div className="mm-section-copy" data-reveal>
          <span className="mm-section-number">03 / THE PORTAL</span>
          <h2>Mount it once.</h2>
          <p>
            The rating flow can start from a screen or an app event.{" "}
            <code>MagicModalPortal</code> owns the stack at the app root and
            resolves each entry.
          </p>
          <Link href="/docs/guides/modal-flows">
            See the flow pattern
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        <div className="mm-owner-map" data-reveal>
          <div className="mm-owner-callers">
            <span>CALLERS</span>
            <code>post.tsx</code>
            <code>comment.tsx</code>
            <code>product.tsx</code>
            <code>notifications.ts</code>
          </div>
          <div className="mm-owner-route" aria-hidden="true">
            <i />
            <span>startRatingFlow()</span>
          </div>
          <div className="mm-owner-function">
            <span>FLOW</span>
            <strong>startRatingFlow()</strong>
            <code>rating(); branch(); thanks();</code>
          </div>
          <div className="mm-owner-route is-portal" aria-hidden="true">
            <span>show()</span>
            <i />
          </div>
          <div className="mm-owner-portal">
            <div>
              <MagicMark size={44} />
              <span>
                <small>APP ROOT</small>
                <strong>MagicModalPortal</strong>
              </span>
            </div>
            <div aria-hidden="true" className="mm-owner-sheet-stack">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </section>

      <section className="mm-show">
        <div className="mm-show-heading" data-reveal>
          <span>04 / SHOW</span>
          <h2>
            <code>show()</code> returns a handle.
          </h2>
          <p>
            Await the promise, target the entry by ID, or replace its rendered
            component before it closes.
          </p>
        </div>

        <div className="mm-show-object" data-reveal>
          <pre aria-label="The object returned by magicModal.show">
            <code>
              <span>{"{"}</span>
              {"\n  "}
              <b>promise</b>
              {": Promise<HideReturn<T>>;"}
              {"\n  "}
              <b>modalID</b>: string;
              {"\n  "}
              <b>update</b>
              {": (next: React.FC) => void;"}
              {"\n"}
              <span>{"}"}</span>
            </code>
          </pre>
          <span className="mm-show-object-tag">AVAILABLE IMMEDIATELY</span>
        </div>

        <dl className="mm-show-ledger">
          <div data-reveal>
            <dt>
              <code>promise</code>
              <span>01</span>
            </dt>
            <dd>Resolves when this entry closes.</dd>
          </div>
          <div data-reveal>
            <dt>
              <code>modalID</code>
              <span>02</span>
            </dt>
            <dd>Targets this entry from another call site.</dd>
          </div>
          <div data-reveal>
            <dt>
              <code>update</code>
              <span>03</span>
            </dt>
            <dd>
              Replaces the rendered component while preserving its ID,
              configuration, backdrop, stack position, and pending promise.
            </dd>
          </div>
        </dl>

        <p className="mm-update-note" data-reveal>
          <span>UPDATE REMOUNTS</span>
          <code>update()</code> replaces the component with a fresh mount. Its
          local React state resets.
        </p>
      </section>

      <section className="mm-close">
        <div className="mm-close-heading" data-reveal>
          <span>05 / HIDE</span>
          <h2>Every close has a reason.</h2>
          <p>
            A submitted answer, backdrop tap, swipe, Android back press, and
            <code> hideAll()</code> are different results. Data is present only
            when the modal calls <code>hide(data)</code>.
          </p>
          <Link href="/docs/reference/hide-results">
            Read HideReturn&lt;T&gt;
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div data-reveal>
          <ResultLab />
        </div>
      </section>

      <section className="mm-history">
        <div className="mm-history-heading" data-reveal>
          <span>06 / HISTORY</span>
          <h2>Four years of production fixes.</h2>
          <p>
            Real apps needed stacked modals, targeted updates, typed close
            reasons, native overlays, and support for newer gesture APIs.
          </p>
        </div>

        <ol className="mm-history-list">
          {history.map(({ date, description, href, title, year }) => (
            <li data-reveal key={year}>
              <a href={href} rel="noreferrer" target="_blank">
                <span className="mm-history-year">{year}</span>
                <span className="mm-history-date">{date}</span>
                <strong>{title}</strong>
                <p>{description}</p>
                <ArrowUpRight aria-hidden="true" size={17} />
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="mm-final">
        <div aria-hidden="true" className="mm-fifth-sheet">
          <i />
          <i />
          <i />
          <i />
          <i />
          <span>5</span>
        </div>
        <div className="mm-final-copy" data-reveal>
          <span>GET STARTED</span>
          <h2>
            Build the
            <br />
            first <em>flow.</em>
          </h2>
          <p>
            The setup guide starts at the app root and ends with a typed{" "}
            <code>HideReturn&lt;T&gt;</code>.
          </p>
          <div>
            <Link href="/docs/getting-started/setup">
              Set up the portal
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <InstallCommand compact />
          </div>
        </div>
      </section>

      <footer className="mm-footer">
        <div>
          <Link className="mm-brand" href="/">
            <MagicMark size={29} />
            <span>Magic Modal</span>
          </Link>
          <p>Created and maintained by Gabriel Taveira.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/docs">Docs</Link>
          <a href="https://github.com/GSTJ/react-native-magic-modal/releases">
            Releases
          </a>
          <a href="https://www.npmjs.com/package/react-native-magic-modal">
            npm
          </a>
          <a href="https://github.com/GSTJ/react-native-magic-modal">Source</a>
        </nav>
        <span>MIT license. Maintained in the open since 2022.</span>
      </footer>
    </main>
  );
}
