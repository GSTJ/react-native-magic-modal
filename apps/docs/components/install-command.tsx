"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Check, Copy } from "lucide-react";

const packageManagers = [
  {
    args: "add react-native-magic-modal",
    command: "pnpm add react-native-magic-modal",
    id: "pnpm",
    label: "pnpm",
  },
  {
    args: "install react-native-magic-modal",
    command: "npm install react-native-magic-modal",
    id: "npm",
    label: "npm",
  },
  {
    args: "add react-native-magic-modal",
    command: "yarn add react-native-magic-modal",
    id: "yarn",
    label: "Yarn",
  },
  {
    args: "add react-native-magic-modal",
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
  const selectedManager =
    packageManagers.find((manager) => manager.id === packageManager) ??
    packageManagers[0];
  const { args, command } = selectedManager;

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
    (event: ChangeEvent<HTMLSelectElement>) => {
      clearTimeout(resetTimer.current);
      setCopyState("idle");
      setPackageManager(event.target.value as PackageManager);
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
    copyFeedback = <>Failed</>;
  }

  return (
    <div className={`mh-install ${compact ? "is-compact" : ""}`}>
      <div className={`mh-install-command ${compact ? "is-compact" : ""}`}>
        <span aria-hidden="true" className="mh-install-prompt">
          $
        </span>
        <select
          aria-label="Package manager"
          className="mh-install-manager-select"
          onChange={selectPackageManager}
          value={packageManager}
        >
          {packageManagers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.label}
            </option>
          ))}
        </select>
        <code>{args}</code>
        <button
          aria-label={`Copy install command: ${command}`}
          className="mh-install-copy"
          onClick={copy}
          type="button"
        >
          <span aria-live="polite">{copyFeedback}</span>
        </button>
      </div>
    </div>
  );
};
