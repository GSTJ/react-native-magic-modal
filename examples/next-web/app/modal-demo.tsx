"use client";

import type { HideReturn } from "magic-modal";

import { useState } from "react";

import {
  MagicModalHideReason,
  MagicModalPortal,
  magicModal,
  useMagicModal,
} from "magic-modal";

type Confirmation = { confirmed: true };

const NestedModal = () => {
  const { hide } = useMagicModal();

  return (
    <section className="modal-card">
      <p className="eyebrow">STACKED FLOW</p>
      <h2>One more check</h2>
      <button data-testid="close-nested" onClick={() => hide()} type="button">
        Close nested modal
      </button>
    </section>
  );
};

const ConfirmationModal = () => {
  const { hide } = useMagicModal<Confirmation>();

  return (
    <section className="modal-card">
      <p className="eyebrow">UNIVERSAL FLOW</p>
      <h2 id="fixture-modal-title">Ship the web build?</h2>
      <p>The same promise contract is available on web, iOS, and Android.</p>
      <button
        data-testid="confirm-modal"
        onClick={() => hide({ confirmed: true })}
        type="button"
      >
        Confirm
      </button>
      <button
        data-testid="open-nested"
        onClick={() =>
          magicModal.show(NestedModal, {
            accessibilityLabel: "One more check",
            swipeDirection: undefined,
          })
        }
        type="button"
      >
        Open nested modal
      </button>
    </section>
  );
};

const describeResult = (result: HideReturn<Confirmation>) => {
  if (result.reason === MagicModalHideReason.INTENTIONAL_HIDE) {
    return result.data.confirmed ? "CONFIRMED" : "CLOSED";
  }

  return result.reason;
};

const SwipeableModal = () => (
  <section className="modal-card">
    <p className="eyebrow">GESTURE FLOW</p>
    <h2>Swipe me away</h2>
    <p data-testid="swipeable-body">Drag downwards to dismiss.</p>
  </section>
);

export const ModalDemo = () => {
  const [result, setResult] = useState("WAITING");

  const open = async () => {
    setResult("OPEN");
    const entry = magicModal.show<Confirmation>(ConfirmationModal, {
      accessibilityLabel: "Ship the web build?",
      swipeDirection: undefined,
    });

    setResult(describeResult(await entry));
  };

  // The only fixture with the gesture armed. Everything else disables it so a
  // stray drag during the other checks cannot dismiss anything.
  const openSwipeable = async () => {
    setResult("OPEN");
    const entry = magicModal.show<Confirmation>(SwipeableModal, {
      accessibilityLabel: "Swipe me away",
      swipeDirection: "down",
    });

    setResult(describeResult(await entry.promise));
  };

  return (
    <div className="fixture-root">
      <button data-testid="open-modal" onClick={open} type="button">
        Open modal
      </button>
      <button
        data-testid="open-swipeable"
        onClick={openSwipeable}
        type="button"
      >
        Open swipeable modal
      </button>
      <output data-testid="modal-result">{result}</output>
      <MagicModalPortal />
    </div>
  );
};
