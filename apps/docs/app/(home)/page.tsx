import Link from "next/link";

import {
  ArrowRight,
  Braces,
  Layers3,
  MoveDown,
  PackageCheck,
  Sparkles,
} from "lucide-react";

import { LegacyAnchorRouter } from "@/components/legacy-anchor-router";
import { MagicMark } from "@/components/magic-mark";
import { ModalPlayground } from "@/components/modal-playground";

const features = [
  {
    description:
      "Open a modal from navigation, services, effects, or any plain function.",
    icon: Sparkles,
    title: "Show from anywhere",
  },
  {
    description:
      "Await a discriminated, generic result instead of coordinating callback soup.",
    icon: Braces,
    title: "Typed async flows",
  },
  {
    description:
      "Multiple modals coexist in a predictable stack with individual IDs.",
    icon: Layers3,
    title: "Real modal stacks",
  },
  {
    description:
      "Directional gestures, animation timings, backdrops, and native overlays.",
    icon: MoveDown,
    title: "Native-feeling motion",
  },
] as const;

export default function HomePage() {
  return (
    <main className="home-page">
      <LegacyAnchorRouter />
      <section className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-copy">
          <div className="eyebrow">
            <PackageCheck size={15} />
            React Native · Expo · TypeScript
          </div>
          <div className="hero-mark">
            <MagicMark size={52} />
          </div>
          <h1>
            Modal flows,
            <br />
            <span>without the ceremony.</span>
          </h1>
          <p>
            Show a modal imperatively from anywhere, await its result, and keep
            the entire flow type-safe.
          </p>
          <div className="hero-actions">
            <Link className="primary-cta" href="/docs">
              Get started
              <ArrowRight size={17} />
            </Link>
            <Link className="secondary-cta" href="/docs/reference">
              Explore the API
            </Link>
          </div>
          <div className="install-pill">
            <span>$</span>
            <code>pnpm add react-native-magic-modal</code>
          </div>
        </div>

        <div className="hero-demo">
          <ModalPlayground />
        </div>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <span>Small API, serious flows</span>
          <h2>The modal becomes a function you can await.</h2>
          <p>
            No global state choreography. No prop drilling. No hand-rolled
            promise resolver hidden in every feature.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ description, icon: Icon, title }) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bottom-cta">
        <div>
          <span>Ready in five minutes</span>
          <h2>Put one portal at the root. Call it from everywhere else.</h2>
        </div>
        <Link href="/docs/getting-started/setup">
          Set up the portal
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
