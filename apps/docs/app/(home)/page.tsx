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
import { ResultLab } from "@/components/result-lab";

const history = [
  {
    date: "21 FEB 2022",
    href: "https://github.com/GSTJ/react-native-magic-modal/commit/64612c8",
    title: "One imperative portal.",
    year: "2022",
    description:
      "The first release removed visibility props from the calling screen. A component factory went to the root; a close value came back.",
  },
  {
    date: "08 JUN 2024",
    href: "https://github.com/GSTJ/react-native-magic-modal/pull/81",
    title: "The portal became a stack.",
    year: "2024",
    description:
      "Independent entries gained their own IDs and resolvers. Reanimated motion, typed close reasons, hideAll, and the iOS overlay followed.",
  },
  {
    date: "27 JUL 2026",
    href: "https://github.com/GSTJ/react-native-magic-modal/releases/tag/magic-modal-9.0.0",
    title: "The awkward edges stayed public.",
    year: "2026",
    description:
      "update() can replace externally driven content in place. Swipe dismissal now works across Gesture Handler 2 and 3.",
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
            React Native · open source since 2022
          </p>
          <h1>
            Product called it a <em>simple flow.</em>
            <br />
            It needed four modals.
          </h1>
          <p className="mm-hero-lede">
            In 2022 a rating prompt branched into feedback or a store review,
            then ended with thanks. When its trigger moved outside React, Magic
            Modal kept the conversation in one async function.
          </p>
          <div className="mm-hero-actions">
            <a className="mm-run-link" href="#original-flow">
              Choose a rating
              <ArrowRight aria-hidden="true" size={17} />
            </a>
            <a
              className="mm-article-link"
              href="https://dev.to/gabrieltaveira/you-have-been-using-react-native-modals-wrong-7hd"
              rel="noreferrer"
              target="_blank"
            >
              <BookOpen aria-hidden="true" size={15} />
              The 2022 write-up
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
          <span>Why four?</span>
          <ArrowDown aria-hidden="true" size={15} />
        </a>
      </section>

      <section className="mm-request" id="request">
        <div className="mm-request-index" data-reveal>
          <span>THE REQUEST</span>
          <strong>01</strong>
        </div>
        <div className="mm-request-copy" data-reveal>
          <p>
            Rate the app after the first like. Under four stars, ask what went
            wrong. Otherwise, ask for a store review. Either way, finish with a
            thank-you.
          </p>
          <aside>
            <span>Three screens later</span>
            <p>
              The same conversation needed to run after liking a post, a
              comment, or a product. Later, the trigger moved outside React.
            </p>
          </aside>
        </div>
        <div aria-hidden="true" className="mm-request-flags" data-reveal>
          <code>isRatingOpen</code>
          <code>isFeedbackOpen</code>
          <code>isStoreReviewOpen</code>
          <code>isThanksOpen</code>
          <span>four booleans still do not describe the conversation</span>
        </div>
      </section>

      <section className="mm-owner">
        <div className="mm-section-copy" data-reveal>
          <span className="mm-section-number">02 / WHERE</span>
          <h2>The screen was the wrong owner.</h2>
          <p>
            A Saga cannot render a component, and repeating a modal wrapper in
            every feed item only moves the mess around. Mount the portal once.
            Let the function that owns the decision start the conversation.
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
            <code>ratingSaga.ts</code>
          </div>
          <div className="mm-owner-route" aria-hidden="true">
            <i />
            <span>startRatingFlow()</span>
          </div>
          <div className="mm-owner-function">
            <span>ONE ASYNC FUNCTION</span>
            <strong>startRatingFlow()</strong>
            <code>owns the branch</code>
          </div>
          <div className="mm-owner-route is-portal" aria-hidden="true">
            <span>show()</span>
            <i />
          </div>
          <div className="mm-owner-portal">
            <div>
              <MagicMark size={44} />
              <span>
                <small>ONE ACTIVE REACT TREE</small>
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
          <span>03 / THE HANDLE</span>
          <h2>
            What <code>show()</code> gives back.
          </h2>
          <p>
            Each call pushes one independent entry. The returned object is
            everything outside code needs to wait for it, address it, or replace
            its content.
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
          <span className="mm-show-object-tag">RETURNED IMMEDIATELY</span>
        </div>

        <dl className="mm-show-ledger">
          <div data-reveal>
            <dt>
              <code>promise</code>
              <span>01</span>
            </dt>
            <dd>Resolves once, when this exact entry closes.</dd>
          </div>
          <div data-reveal>
            <dt>
              <code>modalID</code>
              <span>02</span>
            </dt>
            <dd>Identifies the entry when outside code needs to target it.</dd>
          </div>
          <div data-reveal>
            <dt>
              <code>update</code>
              <span>03</span>
            </dt>
            <dd>
              Mounts replacement content at the same position, with the same ID,
              backdrop, configuration, and pending promise.
            </dd>
          </div>
        </dl>

        <p className="mm-update-note" data-reveal>
          <span>One honest footnote</span>
          The replacement component mounts from scratch. Local React state does
          not survive an <code>update()</code>.
        </p>
      </section>

      <section className="mm-close">
        <div className="mm-close-heading" data-reveal>
          <span>04 / THE EXIT</span>
          <h2>Closing has a type.</h2>
          <p>
            A submitted answer and a dismiss gesture are different outcomes.
            Data exists only after an intentional hide, so the caller has to
            narrow the result before reading it.
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
          <span>05 / FOUR YEARS</span>
          <h2>The edge cases became the library.</h2>
          <p>
            The public API grew when production found another awkward seam—not
            because the landing page needed another feature card.
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
          <span>THE NEXT REQUEST</span>
          <h2>
            Go ahead.
            <br />
            Add the <em>fifth.</em>
          </h2>
          <p>
            The branch can stay in one async function. The portal will handle
            what appears on screen.
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
          <p>Made by Gabriel Taveira from a problem I kept meeting at work.</p>
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
        <span>MIT · maintained in the open since 2022</span>
      </footer>
    </main>
  );
}
