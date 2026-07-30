import Link from "next/link";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Heart,
} from "lucide-react";

import { HomeEffects } from "@/components/home-effects";
import { InstallCommand } from "@/components/install-command";
import { LegacyAnchorRouter } from "@/components/legacy-anchor-router";
import { LivePackageDemo } from "@/components/live-package-demo";
import { MagicMark } from "@/components/magic-mark";
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
          <span>Magic Modal</span>
          <code>
            <ProjectVersion fallback="latest" />
          </code>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#story">Story</a>
          <Link className="mm-nav-mobile-docs" href="/docs">
            Docs
          </Link>
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
            One API for web, iOS, and Android
          </p>
          <h1>Modals you can await</h1>
          <p className="mm-hero-lede">
            Mount one <code>MagicModalPortal</code> at the root of your app.
            Call <code>show()</code> from any async flow and await the typed
            result on web, iOS, and Android.
          </p>
          <div className="mm-hero-actions">
            <a className="mm-run-link" href="#live-package">
              Test two callers
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

        <figure className="mm-stack-story">
          <div className="mm-stack-story-heading">
            <span>LIVE STACK MODEL</span>
            <strong>Two callers, two promises, one portal</strong>
          </div>
          <div className="mm-stack-story-stage">
            <div className="mm-stack-caller is-rating">
              <span>CALLER 01</span>
              <code>feedback.tsx</code>
              <b>show(RatingPrompt)</b>
            </div>
            <div className="mm-stack-caller is-payment">
              <span>CALLER 02</span>
              <code>checkout.tsx</code>
              <b>show(PaymentReview)</b>
            </div>
            <div className="mm-stack-portal">
              <MagicMark size={22} />
              <span>
                <small>APP ROOT</small>
                <strong>MagicModalPortal</strong>
              </span>
            </div>
            <div className="mm-stack-plane is-app">
              <span>Application</span>
            </div>
            <article className="mm-stack-plane is-rating">
              <span>ENTRY 01 · WAITING UNDERNEATH</span>
              <strong>Rating prompt</strong>
              <code>promise: pending</code>
            </article>
            <article className="mm-stack-plane is-payment">
              <span>ENTRY 02 · TOPMOST</span>
              <strong>Payment review</strong>
              <code>promise: resolving...</code>
            </article>
          </div>
          <figcaption>
            <span>
              Close the top entry and the rating promise keeps waiting below it.
            </span>
            <a href="#live-package">
              Run this with the real package
              <ArrowDown aria-hidden="true" size={13} />
            </a>
          </figcaption>
        </figure>

        <a
          aria-label="Continue to the live package demo"
          className="mm-scroll-cue"
          href="#live-package"
        >
          <span>Run the real stack</span>
          <ArrowDown aria-hidden="true" size={15} />
        </a>
      </section>

      <section className="mm-live" id="live-package">
        <header data-reveal>
          <span>REAL PACKAGE · REAL PORTAL</span>
          <h2>Open two callers. Keep both promises.</h2>
          <p>
            Run the concurrent flow, close the payment review on top, then
            finish the rating still waiting underneath. The stack and promise
            ledger update as the package runs.
          </p>
        </header>
        <div>
          <LivePackageDemo />
        </div>
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
            The first Magic Modal flow collected feedback after someone liked a
            post. Several views could start it, await a score, and open the
            matching follow-up from one shared function.
          </p>
          <div className="mm-request-branches">
            <article>
              <span>CALLER OWNED</span>
              <strong>
                {repeatedRatingState.length} pieces of visibility state
              </strong>
              <p>
                Every caller that can start the flow repeats the modal tree and
                its cleanup.
              </p>
            </article>
            <article>
              <span>PORTAL OWNED</span>
              <strong>{ratingCallers.length} callers share one function</strong>
              <p>
                The flow lives outside the UI. Each caller awaits the same
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

      <PracticalExamples />

      <section className="mm-lifecycle">
        <header data-reveal>
          <span>THE COMPLETE CALL</span>
          <h2>
            One <code>show()</code>, one stack entry, one typed result
          </h2>
          <p>
            The caller gets a handle immediately. The portal owns the visible
            entry while its promise waits, then the close reason travels back to
            the same call site.
          </p>
        </header>

        <ol className="mm-lifecycle-steps" data-reveal>
          <li>
            <span>01 · CALLER</span>
            <strong>Open from any async flow</strong>
            <code>const handle = magicModal.show(Prompt)</code>
          </li>
          <li>
            <span>02 · PORTAL</span>
            <strong>Keep its ID and promise in the stack</strong>
            <code>{"{ modalID, promise, update }"}</code>
          </li>
          <li>
            <span>03 · RESULT</span>
            <strong>Resume the caller with the close reason</strong>
            <code>const result = await handle.promise</code>
          </li>
        </ol>

        <div className="mm-lifecycle-result">
          <div className="mm-lifecycle-result-copy" data-reveal>
            <span>TRY EVERY EXIT</span>
            <h3>
              See what <code>HideReturn&lt;T&gt;</code> sends back
            </h3>
            <p>
              Submit data, tap the backdrop, swipe, press Android back, or close
              the whole stack. Each path resolves with an explicit reason.
            </p>
            <div>
              <Link href="/docs/guides/modal-flows">
                See the flow pattern
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
              <Link href="/docs/reference/hide-results">
                Read HideReturn&lt;T&gt;
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </div>
          </div>
          <div data-reveal>
            <ResultLab />
          </div>
        </div>
      </section>

      <section className="mm-final">
        <div aria-hidden="true" className="mm-final-device">
          <div className="mm-final-device-bar">
            <span className="mm-final-device-time">9:41</span>
            <i className="mm-final-device-notch" />
            <span className="mm-final-device-status">
              <span className="mm-final-device-signal">
                <i />
                <i />
                <i />
                <i />
              </span>
              <b>5G</b>
              <span className="mm-final-device-battery">
                <i />
              </span>
            </span>
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
        <div className="mm-final-copy">
          <span>GET STARTED</span>
          <h2>
            Add MagicModal
            <wbr />
            Portal to your app root
          </h2>
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
          <h2>Build your first awaitable modal flow.</h2>
          <p>Start with the setup guide or jump straight into the API.</p>
          <div className="mm-footer-actions">
            <a
              className="mm-footer-author"
              href="https://github.com/GSTJ"
              rel="noreferrer"
              target="_blank"
            >
              Built by Gabriel Taveira
              <ArrowUpRight aria-hidden="true" size={13} />
            </a>
            <a
              className="mm-footer-sponsor"
              href="https://github.com/sponsors/GSTJ"
              rel="noreferrer"
              target="_blank"
            >
              <Heart aria-hidden="true" size={14} />
              Sponsor me
            </a>
          </div>
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
