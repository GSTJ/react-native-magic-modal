"use client";

import { useCallback, useRef, useState } from "react";

import { Check, Copy } from "lucide-react";

const command = "pnpm add react-native-magic-modal";
type CopyState = "copied" | "failed" | "idle";

const fallbackCopy = () => {
  const input = document.createElement("textarea");
  input.value = command;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  try {
    document.body.append(input);
    input.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    input.remove();
  }
};

export const InstallCommand = ({ compact = false }: { compact?: boolean }) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      } else if (!fallbackCopy()) {
        throw new Error("Copy command was rejected");
      }
      setCopyState("copied");
    } catch {
      setCopyState(fallbackCopy() ? "copied" : "failed");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 1800);
  }, []);

  let copyFeedback = (
    <>
      <Copy aria-hidden="true" size={14} />
      copy
    </>
  );
  if (copyState === "copied") {
    copyFeedback = (
      <>
        <Check aria-hidden="true" size={14} />
        copied
      </>
    );
  } else if (copyState === "failed") {
    copyFeedback = <>select</>;
  }

  return (
    <button
      aria-label={`Copy install command: ${command}`}
      className={`mh-install-command ${compact ? "is-compact" : ""}`}
      onClick={copy}
      type="button"
    >
      <span aria-hidden="true" className="mh-install-prompt">
        $
      </span>
      <code>{command}</code>
      <span aria-live="polite" className="mh-install-copy">
        {copyFeedback}
      </span>
    </button>
  );
};
