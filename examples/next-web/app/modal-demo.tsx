"use client";

import type { HideReturn } from "react-native-magic-modal";

import { useState } from "react";
import {
  MagicModalHideReason,
  MagicModalPortal,
  magicModal,
  useMagicModal,
} from "react-native-magic-modal";

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
      <button data-testid="confirm-modal" onClick={() => hide({ confirmed: true })} type="button">
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

export const ModalDemo = () => {
  const [result, setResult] = useState("WAITING");

  const open = async () => {
    setResult("OPEN");
    const entry = magicModal.show<Confirmation>(ConfirmationModal, {
      accessibilityLabel: "Ship the web build?",
      swipeDirection: undefined,
    });

    setResult(describeResult(await entry.promise));
  };

  return (
    <div className="fixture-root">
      <button data-testid="open-modal" onClick={open} type="button">
        Open modal
      </button>
      <output data-testid="modal-result">{result}</output>
      <MagicModalPortal />
    </div>
  );
};
