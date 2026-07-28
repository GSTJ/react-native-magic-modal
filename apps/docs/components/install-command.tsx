"use client";

import { useCallback, useRef, useState } from "react";

import { Check, Copy } from "lucide-react";

const command = "pnpm add react-native-magic-modal";

export const InstallCommand = ({ compact = false }: { compact?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1800);
  }, []);

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
        {copied ? (
          <>
            <Check aria-hidden="true" size={14} />
            copied
          </>
        ) : (
          <>
            <Copy aria-hidden="true" size={14} />
            copy
          </>
        )}
      </span>
    </button>
  );
};
