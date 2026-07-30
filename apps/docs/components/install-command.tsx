"use client";

import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Check, Copy } from "lucide-react";

const packageManagers = [
  {
    command: "pnpm add react-native-magic-modal",
    id: "pnpm",
    label: "pnpm",
  },
  {
    command: "npm install react-native-magic-modal",
    id: "npm",
    label: "npm",
  },
  {
    command: "yarn add react-native-magic-modal",
    id: "yarn",
    label: "Yarn",
  },
  {
    command: "bun add react-native-magic-modal",
    id: "bun",
    label: "Bun",
  },
] as const;

type PackageManager = (typeof packageManagers)[number]["id"];
type CopyState = "copied" | "failed" | "idle";

const fallbackCopy = (command: string) => {
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
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const command =
    packageManagers.find((manager) => manager.id === packageManager)?.command ??
    packageManagers[0].command;

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      } else if (!fallbackCopy(command)) {
        throw new Error("Copy command was rejected");
      }
      setCopyState("copied");
    } catch {
      setCopyState(fallbackCopy(command) ? "copied" : "failed");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 1800);
  }, [command]);

  useEffect(
    () => () => {
      clearTimeout(resetTimer.current);
    },
    [],
  );

  const selectPackageManager = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      clearTimeout(resetTimer.current);
      setCopyState("idle");
      setPackageManager(event.currentTarget.value as PackageManager);
    },
    [],
  );

  let copyFeedback = (
    <>
      <Copy aria-hidden="true" size={14} />
      Copy
    </>
  );
  if (copyState === "copied") {
    copyFeedback = (
      <>
        <Check aria-hidden="true" size={14} />
        Copied
      </>
    );
  } else if (copyState === "failed") {
    copyFeedback = <>Select</>;
  }

  return (
    <div className={`mh-install ${compact ? "is-compact" : ""}`}>
      <fieldset
        aria-label="Choose a package manager"
        className="mh-install-managers"
      >
        {packageManagers.map((manager) => (
          <button
            aria-pressed={packageManager === manager.id}
            className={
              packageManager === manager.id ? "is-selected" : undefined
            }
            key={manager.id}
            onClick={selectPackageManager}
            type="button"
            value={manager.id}
          >
            {manager.label}
          </button>
        ))}
      </fieldset>
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
    </div>
  );
};
