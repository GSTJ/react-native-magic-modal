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
import { LivePackageDemo } from "@/components/live-package-demo";
import { MagicMark } from "@/components/magic-mark";
import { OriginFlow } from "@/components/origin-flow";
import { PracticalExamples } from "@/components/practical-examples";
import {
  ProjectAge,
  ProjectLicense,
  ProjectStars,
  ProjectVersion,
  ProjectWeeklyDownloads,
} from "@/components/project-metadata-values";
import { ResultLab } from "@/components/result-lab";

const ratingCallers = [
  "post.tsx",
  "comment.tsx",
  "product.tsx",
  "notifications.ts",
] as const;

const repeatedRatingState = [
  "isRatingOpen",
  "isFeedbackOpen",
  "isStoreReviewOpen",
  "isThanksOpen",
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
          <code>
            <ProjectVersion fallback="latest" />
          </code>
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
            <MagicMark size={24} />
            A modal stack for React Native
          </p>
          <h1>React Native modals you can await</h1>
          <p className="mm-hero-lede">
            Mount one <code>MagicModalPortal</code> at the app root. Call{" "}
            <code>show()</code> from any async flow and await the typed result.
          </p>
          <div className="mm-hero-actions">
            <a className="mm-run-link" href="#original-flow">
              Try the rating flow
              <ArrowRight aria-hidden="true" size={17} />
            </a>
            <a
              className="mm-article-link"
              href="https://dev.to/gabrieltaveira/you-have-been-using-react-native-modals-wrong-7hd"
              rel="noreferrer"
              target="_blank"
            >
              <BookOpen aria-hidden="true" size={15} />
              Read the origin story
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
          <span>Why it exists</span>
          <ArrowDown aria-hidden="true" size={15} />
        </a>
      </section>

      <aside aria-label="Project activity" className="mm-proof">
        <a
          href="https://github.com/GSTJ/react-native-magic-modal"
          rel="noreferrer"
          target="_blank"
        >
          <strong>
            <ProjectStars fallback="GitHub" />
          </strong>
          <span>GitHub stars</span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
        <a
          href="https://www.npmjs.com/package/react-native-magic-modal"
          rel="noreferrer"
          target="_blank"
        >
          <strong>
            <ProjectWeeklyDownloads fallback="npm" />
          </strong>
          <span>downloads last week</span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
        <a
          href="https://github.com/GSTJ/react-native-magic-modal/releases/latest"
          rel="noreferrer"
          target="_blank"
        >
          <strong>
            <ProjectVersion fallback="latest" />
          </strong>
          <span>current release</span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
        <a
          href="https://github.com/GSTJ/react-native-magic-modal/blob/main/LICENSE"
          rel="noreferrer"
          target="_blank"
        >
          <strong>
            <ProjectLicense fallback="OSS" />
          </strong>
          <span>
            open source <ProjectAge fallback="from day one" />
          </span>
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      </aside>

      <section className="mm-request" id="request">
        <div className="mm-request-copy" data-reveal>
          <span className="mm-section-number">WHY IT EXISTS</span>
          <h2>Two callers can open a modal at the same time</h2>
          <p>
            The first Magic Modal flow asked for an app rating after a like. It
            could start from several screens and branch to feedback or the
            store. Both paths ended with a thank-you.
          </p>
          <div className="mm-request-branches">
            <article>
              <span>SCREEN OWNED</span>
              <strong>
                {repeatedRatingState.length} pieces of visibility state
              </strong>
              <p>
                Every screen that can start the flow repeats the modal tree and
                its cleanup.
              </p>
            </article>
            <article>
              <span>PORTAL OWNED</span>
              <strong>{ratingCallers.length} callers share one function</strong>
              <p>
                The flow lives outside the screens. Each caller awaits the same
                sequence.
              </p>
            </article>
          </div>
          <aside>
            <span>THE FAILURE MODE</span>
            <p>
              A rating prompt can arrive while another modal is still open.
              Single-slot modal systems replace, cancel, or ignore one of them.
              Those failures surface far from the code that caused the race.
            </p>
          </aside>
        </div>
        <div className="mm-request-proof" data-reveal>
          <article>
            <span>IDLE</span>
            <strong>0 modal bodies mounted</strong>
            <p>
              The portal stays empty until <code>show()</code> runs.
            </p>
          </article>
          <article>
            <span>OPEN</span>
            <strong>One ID and promise per entry</strong>
            <p>Concurrent prompts keep their own place in the stack.</p>
          </article>
          <article>
            <span>CODE</span>
            <strong>
              {ratingCallers.length} callers share{" "}
              <code>startRatingFlow()</code>
            </strong>
            <p>
              The shared flow owns the modal components and visibility state.
            </p>
          </article>
          <a
            href="https://github.com/GSTJ/react-native-magic-modal/blob/main/packages/modal/src/components/MagicModalPortal/magic-modal-portal.test.tsx"
            rel="noreferrer"
            target="_blank"
          >
            See the portal tests
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </div>
      </section>

      <section className="mm-live">
        <header data-reveal>
          <span>LIVE PACKAGE</span>
          <h2>Test two calls in one stack</h2>
          <p>
            Start the rating flow and stack a notification over it. Close the
            top entry and the first promise is still waiting underneath.
          </p>
        </header>
        <div>
          <LivePackageDemo />
        </div>
      </section>

      <PracticalExamples />

      <section className="mm-owner">
        <div className="mm-section-copy" data-reveal>
          <span className="mm-section-number">APP ROOT</span>
          <h2>Mount one portal at the app root</h2>
          <p>
            Modal calls can come from anywhere in the app. Each{" "}
            <code>show()</code> gets an ID and promise, so one flow cannot
            overwrite the modal that was already open.
          </p>
          <Link href="/docs/guides/modal-flows">
            See the flow pattern
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        <div className="mm-owner-map" data-reveal>
          <div className="mm-owner-callers">
            <span>CALLERS</span>
            {ratingCallers.map((caller) => (
              <code key={caller}>{caller}</code>
            ))}
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
          <span>RETURN VALUE</span>
          <h2>
            What <code>magicModal.show()</code> returns
          </h2>
          <p>
            Await the close result, target this stack entry by ID, or replace
            its component while the same promise stays pending.
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
              Replaces the component while its ID, backdrop, stack position, and
              pending promise stay put.
            </dd>
          </div>
        </dl>

        <p className="mm-update-note" data-reveal>
          <span>UPDATE REMOUNTS</span>
          <code>update()</code> starts a fresh component mount. Local React
          state resets.
        </p>
      </section>

      <section className="mm-close">
        <div className="mm-close-heading" data-reveal>
          <span>CLOSE RESULTS</span>
          <h2>
            What <code>HideReturn&lt;T&gt;</code> records
          </h2>
          <p>
            A submitted answer, backdrop tap, swipe, Android back press, and{" "}
            <code>hideAll()</code> resolve differently. Only{" "}
            <code>hide(data)</code> returns a payload.
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

      <section className="mm-final">
        <div aria-hidden="true" className="mm-final-device">
          <div className="mm-final-device-bar">
            <span>9:41</span>
            <i />
            <span>5G</span>
          </div>
          <div className="mm-final-device-screen">
            <header>
              <MagicMark size={24} />
              <strong>Moments</strong>
              <span>
                <i />
                <i />
                <i />
              </span>
            </header>
            <div className="mm-final-device-feed">
              <i />
              <span />
              <span />
              <span />
            </div>
            <div className="mm-final-device-stack">
              <i />
              <i />
              <article>
                <span>RATING FLOW</span>
                <strong>How was your visit?</strong>
                <small>The rating promise is still pending.</small>
                <div>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <b key={score}>{score}</b>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
        <div className="mm-final-copy" data-reveal>
          <span>GET STARTED</span>
          <h2>Add MagicModalPortal to your app root</h2>
          <p>
            The setup guide mounts the app-root portal and shows how to await a
            typed <code>HideReturn&lt;T&gt;</code>.
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
        <div className="mm-footer-intro">
          <Link className="mm-brand" href="/">
            <MagicMark size={29} />
            <span>Magic Modal</span>
          </Link>
          <p>
            Awaitable React Native modal flows with one portal and one ordered
            stack.
          </p>
          <a href="https://github.com/GSTJ" rel="noreferrer" target="_blank">
            Built by Gabriel Taveira
            <ArrowUpRight aria-hidden="true" size={13} />
          </a>
        </div>
        <nav aria-label="Learn">
          <strong>Learn</strong>
          <Link href="/docs/getting-started/setup">Setup</Link>
          <Link href="/docs/guides/modal-flows">Modal flows</Link>
          <Link href="/docs/reference">API reference</Link>
          <Link href="/docs/reference/hide-results">Close results</Link>
        </nav>
        <nav aria-label="Project">
          <strong>Project</strong>
          <a
            href="https://github.com/GSTJ/react-native-magic-modal"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <a
            href="https://github.com/GSTJ/react-native-magic-modal/releases"
            rel="noreferrer"
            target="_blank"
          >
            Releases
          </a>
          <a
            href="https://www.npmjs.com/package/react-native-magic-modal"
            rel="noreferrer"
            target="_blank"
          >
            npm
          </a>
          <a
            href="https://github.com/GSTJ/react-native-magic-modal/issues"
            rel="noreferrer"
            target="_blank"
          >
            Issues
          </a>
        </nav>
        <div className="mm-footer-meta">
          <span>
            <ProjectLicense fallback="Open source" /> license
          </span>
          <span>
            <ProjectVersion fallback="Latest release" />
          </span>
        </div>
      </footer>
    </main>
  );
}
