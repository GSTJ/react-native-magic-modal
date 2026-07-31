import type { PortalContainerProps } from "./magic-modal-portal-base";

import React from "react";

import {
  classes,
  MODAL_CLASS,
  MODAL_STYLESHEET,
} from "../webModal/modal-styles";

/**
 * The browser portal container, and the one place the chrome's CSS is emitted.
 *
 * The stylesheet is a `<style>` element inside the React tree rather than
 * something injected into `document.head`, for three reasons: a server render
 * already contains it, so a modal is never briefly unstyled; nothing has to
 * touch `document` to install it, so a Next.js server component can import this
 * module; and there is exactly one portal in an application, so there is
 * exactly one copy of it.
 */
export const PortalContainer = ({
  children,
  hasLiveModals,
}: PortalContainerProps) => (
  <>
    <style>{MODAL_STYLESHEET}</style>
    <div
      aria-hidden={hasLiveModals ? undefined : true}
      className={classes(MODAL_CLASS.portal, MODAL_CLASS.boxNone)}
      data-testid="magic-modal-portal"
    >
      {children}
    </div>
  </>
);
