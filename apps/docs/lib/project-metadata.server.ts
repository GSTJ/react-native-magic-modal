import "server-only";
import { cache } from "react";

import {
  emptyProjectMetadataSnapshot,
  fetchProjectMetadata,
} from "./project-metadata";

const FETCH_TIMEOUT_MILLISECONDS = 8_000;

export const getProjectMetadataSnapshot = cache(async () => {
  try {
    return await fetchProjectMetadata({
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MILLISECONDS),
    });
  } catch {
    return emptyProjectMetadataSnapshot();
  }
});
