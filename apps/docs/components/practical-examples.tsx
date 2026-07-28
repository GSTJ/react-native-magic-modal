"use client";

import type { CSSProperties, MouseEvent } from "react";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { gsap } from "gsap";
import { ArrowRight, Check, Upload } from "lucide-react";

type ExampleID = "confirm" | "follow-up" | "update";
type ExamplePhase =
  | "account-picked"
  | "complete"
  | "details"
  | "ready"
  | "resolved"
  | "uploaded"
  | "uploading";

type Example = {
  code: string;
  file: string;
  id: ExampleID;
  label: string;
  note: string;
  type: ExampleID;
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
  note: "Press the modal action to resolve the promise.",
  type: "confirm",
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
    note: "The first result decides which modal opens next.",
    type: "follow-up",
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
    note: "Progress replaces the active component without closing it.",
    type: "update",
  },
];

const findExample = (id: ExampleID) =>
  examples.find((example) => example.id === id) ?? confirmExample;

const nextExample: Record<Exclude<ExampleID, "update">, ExampleID> = {
  confirm: "follow-up",
  "follow-up": "update",
};

const getPreview = (
  activeID: ExampleID,
  phase: ExamplePhase,
  progress: number,
) => {
  if (activeID === "confirm") {
    if (phase === "resolved") {
      return {
        action: "Opening the next example",
        body: "The confirmed result triggered deletePost(postID).",
        disabled: true,
        result: "{ confirmed: true }",
        title: "Promise resolved",
      };
    }
    return {
      action: "Delete post",
      body: "This action cannot be undone.",
      disabled: false,
      result: "Promise pending",
      title: "Delete this post?",
    };
  }

  if (activeID === "follow-up") {
    if (phase === "account-picked") {
      return {
        action: "Opening AccountDetails",
        body: "The first promise returned the selected account.",
        disabled: true,
        result: '{ account: "Personal" }',
        title: "Account selected",
      };
    }
    if (phase === "details" || phase === "complete") {
      return {
        action: phase === "complete" ? "Opening upload" : "Done",
        body: "The account result opened this modal.",
        disabled: phase === "complete",
        result:
          phase === "complete" ? "Flow complete" : "Follow-up promise pending",
        title: "Personal account",
      };
    }
    return {
      action: "Continue",
      body: "Personal account, ending in 4821",
      disabled: false,
      result: "Promise pending",
      title: "Choose an account",
    };
  }

  if (phase === "uploading") {
    return {
      action: `Uploading ${progress}%`,
      body: "update() remounts the sheet at each checkpoint.",
      disabled: true,
      result: `${progress}% | promise pending`,
      title: "Upload in progress",
    };
  }
  if (phase === "uploaded") {
    return {
      action: "Close modal",
      body: "The upload finished. The same promise is still pending.",
      disabled: false,
      result: "100% | promise pending",
      title: "Upload complete",
    };
  }
  if (phase === "complete") {
    return {
      action: "Replay the flow",
      body: "Closing the modal resolved the original promise.",
      disabled: false,
      result: "Promise resolved",
      title: "Flow complete",
    };
  }
  return {
    action: "Start upload",
    body: "video-final.mp4",
    disabled: false,
    result: "0% | promise pending",
    title: "Ready to upload",
  };
};

export const PracticalExamples = () => {
  const [activeID, setActiveID] = useState<ExampleID>("confirm");
  const [phase, setPhase] = useState<ExamplePhase>("ready");
  const [progress, setProgress] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = findExample(activeID);
  const preview = getPreview(activeID, phase, progress);

  const openExample = useCallback((id: ExampleID) => {
    setActiveID(id);
    setPhase("ready");
    setProgress(0);
  }, []);

  const selectExample = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      openExample(event.currentTarget.dataset.example as ExampleID);
    },
    [openExample],
  );

  const runPreview = useCallback(() => {
    if (activeID === "confirm") {
      setPhase("resolved");
      return;
    }
    if (activeID === "follow-up") {
      if (phase === "ready") setPhase("account-picked");
      if (phase === "details") setPhase("complete");
      return;
    }
    if (phase === "ready") {
      setProgress(0);
      setPhase("uploading");
      return;
    }
    if (phase === "uploaded") {
      setPhase("complete");
      return;
    }
    if (phase === "complete") openExample("confirm");
  }, [activeID, openExample, phase]);

  useEffect(() => {
    if (activeID === "confirm" && phase === "resolved") {
      const timeout = window.setTimeout(
        () => openExample(nextExample.confirm),
        900,
      );
      return () => window.clearTimeout(timeout);
    }
    if (activeID === "follow-up" && phase === "account-picked") {
      const timeout = window.setTimeout(() => setPhase("details"), 750);
      return () => window.clearTimeout(timeout);
    }
    if (activeID === "follow-up" && phase === "complete") {
      const timeout = window.setTimeout(
        () => openExample(nextExample["follow-up"]),
        900,
      );
      return () => window.clearTimeout(timeout);
    }
  }, [activeID, openExample, phase]);

  const progressStyle = useMemo(
    () =>
      ({
        "--mm-example-progress": `${progress}%`,
      }) as CSSProperties,
    [progress],
  );

  useEffect(() => {
    if (activeID !== "update" || phase !== "uploading") return;

    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 8, 100);
        if (next === 100) {
          window.clearInterval(interval);
          window.setTimeout(() => setPhase("uploaded"), 260);
        }
        return next;
      });
    }, 110);

    return () => window.clearInterval(interval);
  }, [activeID, phase]);

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
          { autoAlpha: 0, x: -14 },
          { autoAlpha: 1, duration: 0.36, x: 0 },
        )
        .fromTo(
          "[data-example-preview]",
          { autoAlpha: 0, scale: 0.98, x: 18 },
          {
            autoAlpha: 1,
            duration: 0.45,
            scale: 1,
            x: 0,
          },
          0.04,
        );
    }, panelRef);

    return () => context.revert();
  }, [activeID]);

  return (
    <section className="mm-examples" id="examples">
      <header data-reveal>
        <span>03 / EXAMPLES</span>
        <h2>
          Await the result. <code>Keep going.</code>
        </h2>
        <p>
          Each action resolves or updates the current modal. The result decides
          what opens next.
        </p>
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
              <code>{phase === "complete" ? "stack empty" : "1 entry"}</code>
            </div>
            <article data-phase={phase} data-preview={active.type}>
              <span className="mm-example-handle" />
              <div className="mm-example-preview-icon" aria-hidden="true">
                {active.type === "update" ? (
                  <Upload size={18} />
                ) : (
                  <Check size={18} />
                )}
              </div>
              <h3>{preview.title}</h3>
              <p>{preview.body}</p>
              {active.type === "update" && (
                <div
                  aria-label={`${progress}% uploaded`}
                  className="mm-example-progress"
                  style={progressStyle}
                >
                  <span />
                </div>
              )}
              <button
                disabled={preview.disabled}
                onClick={runPreview}
                type="button"
              >
                {preview.action}
              </button>
            </article>
            <div
              aria-live="polite"
              className="mm-example-result"
              data-example-result
            >
              <span>RESULT</span>
              <code>{preview.result}</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
