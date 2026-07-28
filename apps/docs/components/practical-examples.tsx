"use client";

import type { MouseEvent } from "react";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { gsap } from "gsap";
import { ArrowRight, Check, Upload } from "lucide-react";

type ExampleID = "confirm" | "follow-up" | "update";

type Example = {
  code: string;
  file: string;
  id: ExampleID;
  label: string;
  note: string;
  preview: {
    action: string;
    body: string;
    result: string;
    title: string;
    type: "confirm" | "follow-up" | "update";
  };
};

const confirmExample: Example = {
  code: `const result = await magicModal
  .show<Confirmation>(() => (
    <DeletePostModal />
  ))
  .promise;

if (
  result.reason === INTENTIONAL_HIDE &&
  result.data.confirmed
) {
  await deletePost(postID);
}`,
  file: "delete-post.tsx",
  id: "confirm",
  label: "Await a decision",
  note: "Delete only after the modal returns confirmed: true.",
  preview: {
    action: "Delete post",
    body: "This can't be undone.",
    result: "{ confirmed: true }",
    title: "Delete this post?",
    type: "confirm",
  },
};

const examples: Example[] = [
  confirmExample,
  {
    code: `const account = await magicModal
  .show<Account>(() => <AccountPicker />)
  .promise;

if (account.reason === INTENTIONAL_HIDE) {
  await magicModal
    .show(() => (
      <AccountDetails account={account.data} />
    ))
    .promise;
}`,
    file: "account-flow.tsx",
    id: "follow-up",
    label: "Open a follow-up",
    note: "Use the first result to decide which modal opens next.",
    preview: {
      action: "Continue",
      body: "Personal account, ending in 4821",
      result: "AccountDetails",
      title: "Choose an account",
      type: "follow-up",
    },
  },
  {
    code: `const { update, promise } = magicModal.show(
  () => <UploadModal progress={0} />
);

upload.onProgress((progress) => {
  update(() => (
    <UploadModal progress={progress} />
  ));
});

await promise;`,
    file: "upload.tsx",
    id: "update",
    label: "Update in place",
    note: "update() replaces the content of the active stack entry.",
    preview: {
      action: "Uploading",
      body: "video-final.mp4",
      result: "68%",
      title: "Upload in progress",
      type: "update",
    },
  },
];

const findExample = (id: ExampleID) =>
  examples.find((example) => example.id === id) ?? confirmExample;

export const PracticalExamples = () => {
  const [activeID, setActiveID] = useState<ExampleID>("confirm");
  const panelRef = useRef<HTMLDivElement>(null);
  const active = findExample(activeID);
  const selectExample = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setActiveID(event.currentTarget.dataset.example as ExampleID);
  }, []);

  useLayoutEffect(() => {
    if (!panelRef.current) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          "[data-example-code]",
          { autoAlpha: 0, x: -18 },
          { autoAlpha: 1, duration: 0.42, x: 0 },
        )
        .fromTo(
          "[data-example-preview]",
          { autoAlpha: 0, rotate: 1.2, scale: 0.97, x: 24 },
          {
            autoAlpha: 1,
            duration: 0.52,
            rotate: 0,
            scale: 1,
            x: 0,
          },
          0.06,
        )
        .fromTo(
          "[data-example-result]",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, duration: 0.35, y: 0 },
          0.24,
        );
    }, panelRef);

    return () => context.revert();
  }, [activeID]);

  return (
    <section className="mm-examples" id="examples">
      <header data-reveal>
        <span>02 / EXAMPLES</span>
        <h2>
          Run real flows with <code>show()</code>.
        </h2>
        <p>Each tab pairs app code with the modal rendered by the portal.</p>
      </header>

      <div className="mm-examples-shell" data-reveal>
        <div
          aria-label="Practical Magic Modal examples"
          className="mm-example-tabs"
          role="tablist"
        >
          {examples.map((example, index) => (
            <button
              aria-controls={`example-panel-${example.id}`}
              aria-selected={activeID === example.id}
              data-example={example.id}
              id={`example-tab-${example.id}`}
              key={example.id}
              onClick={selectExample}
              role="tab"
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{example.label}</strong>
              <small>{example.note}</small>
              <ArrowRight aria-hidden="true" size={16} />
            </button>
          ))}
        </div>

        <div
          aria-labelledby={`example-tab-${active.id}`}
          className="mm-example-panel"
          id={`example-panel-${active.id}`}
          key={active.id}
          ref={panelRef}
          role="tabpanel"
        >
          <div className="mm-example-code" data-example-code>
            <div>
              <i aria-hidden="true">
                <span />
                <span />
                <span />
              </i>
              <code>{active.file}</code>
            </div>
            <pre>
              <code>{active.code}</code>
            </pre>
          </div>

          <div className="mm-example-preview" data-example-preview>
            <div className="mm-example-preview-meta">
              <span>MagicModalPortal</span>
              <code>1 entry</code>
            </div>
            <article data-preview={active.preview.type}>
              <span className="mm-example-handle" />
              <div className="mm-example-preview-icon" aria-hidden="true">
                {active.preview.type === "update" ? (
                  <Upload size={18} />
                ) : (
                  <Check size={18} />
                )}
              </div>
              <h3>{active.preview.title}</h3>
              <p>{active.preview.body}</p>
              {active.preview.type === "update" && (
                <div className="mm-example-progress" aria-label="68% uploaded">
                  <span />
                </div>
              )}
              <button tabIndex={-1} type="button">
                {active.preview.action}
              </button>
            </article>
            <div className="mm-example-result" data-example-result>
              <span>
                {active.preview.type === "update" ? "CURRENT" : "RESULT"}
              </span>
              <code>{active.preview.result}</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
