"use client";

import type {
  ProjectMetadata,
  ProjectMetadataSnapshot,
} from "@/lib/project-metadata";

import type { ReactNode } from "react";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  deriveProjectMetadata,
  fetchProjectMetadata,
  isProjectMetadataFresh,
  mergeProjectMetadataSnapshots,
  parseProjectMetadataCache,
  preferNewerProjectMetadata,
} from "@/lib/project-metadata";

const CACHE_KEY = "magic-modal:project-metadata:v1";
const DEFAULT_MAX_AGE_MILLISECONDS = 6 * 60 * 60 * 1_000;
const FETCH_TIMEOUT_MILLISECONDS = 8_000;
const FAILED_REFRESH_COOLDOWN_MILLISECONDS = 5 * 60 * 1_000;

export type ProjectMetadataStatus = "ready" | "refreshing" | "unavailable";

type ProjectMetadataContextValue = {
  metadata: ProjectMetadata;
  revalidate: () => Promise<ProjectMetadataSnapshot>;
  status: ProjectMetadataStatus;
};

type ProjectMetadataProviderProps = {
  children: ReactNode;
  initialSnapshot: ProjectMetadataSnapshot;
  maxAgeMilliseconds?: number;
};

const ProjectMetadataContext =
  createContext<ProjectMetadataContextValue | null>(null);

let activeRefresh: Promise<ProjectMetadataSnapshot> | null = null;

const timeoutSignal = () =>
  typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(FETCH_TIMEOUT_MILLISECONDS)
    : undefined;

const refreshProjectMetadata = () => {
  if (activeRefresh === null) {
    activeRefresh = fetchProjectMetadata({
      signal: timeoutSignal(),
    }).finally(() => {
      activeRefresh = null;
    });
  }
  return activeRefresh;
};

const readCache = () => {
  try {
    return parseProjectMetadataCache(window.localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
};

const writeCache = (snapshot: ProjectMetadataSnapshot) => {
  if (snapshot.fetchedAt === null) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // The snapshot still works for this page when storage is unavailable.
  }
};

const hasAnySource = (snapshot: ProjectMetadataSnapshot) =>
  Object.values(snapshot.sources).some(Boolean);

export const ProjectMetadataProvider = ({
  children,
  initialSnapshot,
  maxAgeMilliseconds = DEFAULT_MAX_AGE_MILLISECONDS,
}: ProjectMetadataProviderProps) => {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [status, setStatus] = useState<ProjectMetadataStatus>(
    hasAnySource(initialSnapshot) ? "ready" : "unavailable",
  );
  const lastRefreshAttempt = useRef(Number.NEGATIVE_INFINITY);
  const snapshotRef = useRef(initialSnapshot);

  const updateSnapshot = useCallback((next: ProjectMetadataSnapshot) => {
    snapshotRef.current = next;
    setSnapshot(next);
    setStatus(hasAnySource(next) ? "ready" : "unavailable");
  }, []);

  const revalidate = useCallback(async () => {
    lastRefreshAttempt.current = Date.now();
    setStatus("refreshing");
    try {
      const refreshed = await refreshProjectMetadata();
      const next = mergeProjectMetadataSnapshots(
        snapshotRef.current,
        refreshed,
      );
      updateSnapshot(next);
      writeCache(next);
      return next;
    } catch {
      const { current } = snapshotRef;
      setStatus(hasAnySource(current) ? "ready" : "unavailable");
      return current;
    }
  }, [updateSnapshot]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const cached = readCache();
      const preferred =
        cached === null
          ? initialSnapshot
          : preferNewerProjectMetadata(initialSnapshot, cached);
      updateSnapshot(preferred);
      writeCache(preferred);
    });
    return () => {
      cancelled = true;
    };
  }, [initialSnapshot, updateSnapshot]);

  useEffect(() => {
    const now = Date.now();
    const fetchedAt =
      snapshot.fetchedAt === null
        ? Number.NEGATIVE_INFINITY
        : Date.parse(snapshot.fetchedAt);
    const refreshDelay = isProjectMetadataFresh(
      snapshot,
      maxAgeMilliseconds,
      now,
    )
      ? maxAgeMilliseconds - (now - fetchedAt)
      : Math.max(
          0,
          FAILED_REFRESH_COOLDOWN_MILLISECONDS -
            (now - lastRefreshAttempt.current),
        );
    const refreshTimer = window.setTimeout(
      () => {
        void revalidate();
      },
      Math.min(Math.max(refreshDelay, 0), 2_147_483_647),
    );
    return () => window.clearTimeout(refreshTimer);
  }, [maxAgeMilliseconds, revalidate, snapshot]);

  useEffect(() => {
    const receiveCache = (event: StorageEvent) => {
      if (event.key !== CACHE_KEY) return;
      const cached = parseProjectMetadataCache(event.newValue);
      if (cached === null) return;
      updateSnapshot(preferNewerProjectMetadata(snapshotRef.current, cached));
    };
    window.addEventListener("storage", receiveCache);
    return () => window.removeEventListener("storage", receiveCache);
  }, [updateSnapshot]);

  const value = useMemo<ProjectMetadataContextValue>(
    () => ({
      metadata: deriveProjectMetadata(snapshot),
      revalidate,
      status,
    }),
    [revalidate, snapshot, status],
  );

  return (
    <ProjectMetadataContext.Provider value={value}>
      {children}
    </ProjectMetadataContext.Provider>
  );
};

export const useProjectMetadata = () => {
  const context = useContext(ProjectMetadataContext);
  if (context === null) {
    throw new Error(
      "useProjectMetadata must be rendered inside ProjectMetadataProvider.",
    );
  }
  return context;
};
