import { MagicModalHideReason } from "react-native-magic-modal";

import { showMagicModal } from "../magic-modal";

export async function typecheckMagicModalResult() {
  const { promise } = showMagicModal({
    title: "Delete this project?",
    actions: [
      {
        label: "Delete",
        value: "delete" as const,
        variant: "destructive",
      },
    ],
  });

  const result = await promise;

  if (result.reason === MagicModalHideReason.INTENTIONAL_HIDE && result.data.type === "action") {
    const action: "delete" = result.data.value;
    return action;
  }

  return undefined;
}
