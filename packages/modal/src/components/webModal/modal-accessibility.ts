import type { ModalChildren } from "../../constants/types";

import type { View, ViewProps } from "react-native";

import { useEffect } from "react";

/**
 * The dialog semantics and the DOM focus trap, shared by both modal chromes.
 *
 * `useWebModalFocus` is a no-op wherever there is no `document`, which is every
 * native runtime. It lives here rather than in either chrome because the
 * browser chrome and the React Native one both need it: react-native-web apps
 * and React Native Web-in-Expo builds reach the DOM through the native chrome
 * too.
 */

export const MODAL_DIALOG_TEST_ID = "magic-modal-dialog";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getFocusableElements = (dialog: HTMLElement) =>
  [...dialog.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true" &&
      !element.closest("[inert]"),
  );

const focusFirstElement = (dialog: HTMLElement) => {
  const autoFocusTarget = dialog.querySelector<HTMLElement>("[autofocus]");
  const target = autoFocusTarget ?? getFocusableElements(dialog)[0] ?? dialog;

  target.focus();
};

export const getStackEntryAccessibilityProps = (
  isTopmost: boolean,
): Pick<
  ViewProps,
  | "accessibilityElementsHidden"
  | "aria-hidden"
  | "importantForAccessibility"
  | "pointerEvents"
> => ({
  accessibilityElementsHidden: !isTopmost,
  "aria-hidden": !isTopmost,
  importantForAccessibility: isTopmost ? "auto" : "no-hide-descendants",
  pointerEvents: isTopmost ? "box-none" : "none",
});

export const getDialogAccessibilityProps = ({
  accessibilityLabel,
  isTopmost,
  onSystemDismiss,
}: {
  accessibilityLabel: string | undefined;
  isTopmost: boolean;
  onSystemDismiss: () => void;
}): Pick<
  ViewProps,
  | "accessibilityLabel"
  | "accessibilityViewIsModal"
  | "aria-modal"
  | "importantForAccessibility"
  | "onAccessibilityEscape"
  | "role"
  | "tabIndex"
> => ({
  accessibilityLabel: isTopmost ? accessibilityLabel : undefined,
  accessibilityViewIsModal: isTopmost,
  "aria-modal": isTopmost ? true : undefined,
  importantForAccessibility: isTopmost ? "auto" : "no-hide-descendants",
  onAccessibilityEscape: isTopmost ? onSystemDismiss : undefined,
  role: isTopmost ? "dialog" : undefined,
  tabIndex: isTopmost ? -1 : undefined,
});

export const useWebModalFocus = ({
  childrenIdentity,
  dialogNode,
  isTopmost,
  onSystemDismiss,
}: {
  childrenIdentity: ModalChildren;
  dialogNode: View | null;
  isTopmost: boolean;
  onSystemDismiss: () => void;
}) => {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const dialog = dialogNode as unknown as HTMLElement | null;
    const focusToRestore =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    return () => {
      if (!focusToRestore) {
        return;
      }

      window.requestAnimationFrame(() => {
        // React Strict Mode replays effects without removing the mounted
        // dialog. That cleanup is not a real dismissal and must not return
        // focus to the opener.
        if (
          dialog &&
          document.contains(dialog) &&
          dialog.getAttribute("aria-modal") === "true"
        ) {
          return;
        }

        if (!document.contains(focusToRestore)) {
          return;
        }

        const activeDialog = document.querySelector<HTMLElement>(
          `[data-testid="${MODAL_DIALOG_TEST_ID}"][aria-modal="true"]`,
        );

        if (
          activeDialog &&
          activeDialog !== dialog &&
          !activeDialog.contains(focusToRestore)
        ) {
          return;
        }

        focusToRestore.focus();
      });
    };
  }, [dialogNode]);

  useEffect(() => {
    if (!isTopmost || typeof document === "undefined") {
      return;
    }

    const dialog = dialogNode as unknown as HTMLElement | null;

    if (!dialog) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      if (!dialog.contains(document.activeElement)) {
        focusFirstElement(dialog);
      }
    });

    const keepFocusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        focusFirstElement(dialog);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onSystemDismiss();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(dialog);

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const [first] = focusable;
      const last = focusable.at(-1);
      const { activeElement } = document;

      if (
        event.shiftKey &&
        (activeElement === first || activeElement === dialog)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === last || !dialog.contains(activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("focusin", keepFocusInside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("focusin", keepFocusInside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [childrenIdentity, dialogNode, isTopmost, onSystemDismiss]);
};
