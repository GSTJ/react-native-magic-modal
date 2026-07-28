export const projectMetadataConfig = {
  githubApi: "https://api.github.com/repos/GSTJ/react-native-magic-modal",
  npmDownloadsApi:
    "https://api.npmjs.org/downloads/point/last-week/react-native-magic-modal",
  npmPackage: "react-native-magic-modal",
  npmRegistryApi: "https://registry.npmjs.org/react-native-magic-modal/latest",
  repository: "https://github.com/GSTJ/react-native-magic-modal",
} as const;

export type ProjectMetadataSource = "github" | "npmDownloads" | "npmRegistry";

export type ProjectMetadataSnapshot = {
  createdAt: string | null;
  downloadsLastWeek: number | null;
  fetchedAt: string | null;
  latestVersion: string | null;
  license: string | null;
  sources: Record<ProjectMetadataSource, boolean>;
  stars: number | null;
};

export type ProjectMetadata = ProjectMetadataSnapshot & {
  ageYears: number | null;
  createdYear: number | null;
  releaseUrl: string | null;
  versionLabel: string | null;
};

type FetchProjectMetadataOptions = {
  fetcher?: typeof fetch;
  githubToken?: string;
  now?: () => Date;
  signal?: AbortSignal;
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const isNullableCount = (value: unknown): value is number | null =>
  value === null ||
  (typeof value === "number" && Number.isSafeInteger(value) && value >= 0);

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

const normalizeDate = (value: unknown): string | null => {
  if (typeof value !== "string" || !isValidDate(value)) return null;
  return new Date(value).toISOString();
};

const normalizeCount = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    return null;
  }
  return value;
};

const normalizeLicense = (value: unknown): string | null => {
  if (!isRecord(value)) return null;
  const spdxID = value.spdx_id;
  if (
    typeof spdxID !== "string" ||
    !/^[0-9A-Za-z.+-]{1,64}$/.test(spdxID) ||
    spdxID === "NOASSERTION"
  ) {
    return null;
  }
  return spdxID;
};

const normalizeVersion = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const version = value.trim().replace(/^v/, "");
  if (
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)
  ) {
    return null;
  }
  return version;
};

const successfulSourceCount = (sources: ProjectMetadataSnapshot["sources"]) =>
  Object.values(sources).filter(Boolean).length;

const fetchJSON = async (
  fetcher: typeof fetch,
  url: string,
  init: RequestInit,
): Promise<UnknownRecord | null> => {
  try {
    const response = await fetcher(url, init);
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    return isRecord(payload) ? payload : null;
  } catch {
    return null;
  }
};

export const emptyProjectMetadataSnapshot = (): ProjectMetadataSnapshot => ({
  createdAt: null,
  downloadsLastWeek: null,
  fetchedAt: null,
  latestVersion: null,
  license: null,
  sources: {
    github: false,
    npmDownloads: false,
    npmRegistry: false,
  },
  stars: null,
});

export const isProjectMetadataSnapshot = (
  value: unknown,
): value is ProjectMetadataSnapshot => {
  if (!isRecord(value) || !isRecord(value.sources)) return false;

  return (
    isNullableString(value.createdAt) &&
    (value.createdAt === null || isValidDate(value.createdAt)) &&
    isNullableCount(value.downloadsLastWeek) &&
    isNullableString(value.fetchedAt) &&
    (value.fetchedAt === null || isValidDate(value.fetchedAt)) &&
    isNullableString(value.latestVersion) &&
    (value.latestVersion === null ||
      normalizeVersion(value.latestVersion) === value.latestVersion) &&
    isNullableString(value.license) &&
    (value.license === null || /^[0-9A-Za-z.+-]{1,64}$/.test(value.license)) &&
    typeof value.sources.github === "boolean" &&
    typeof value.sources.npmDownloads === "boolean" &&
    typeof value.sources.npmRegistry === "boolean" &&
    isNullableCount(value.stars)
  );
};

export const fetchProjectMetadata = async ({
  fetcher = fetch,
  githubToken,
  now = () => new Date(),
  signal,
}: FetchProjectMetadataOptions = {}): Promise<ProjectMetadataSnapshot> => {
  const githubHeaders = new Headers({
    Accept: "application/vnd.github+json",
  });
  if (githubToken) {
    githubHeaders.set("Authorization", `Bearer ${githubToken}`);
  }

  const [github, npmDownloads, npmRegistry] = await Promise.all([
    fetchJSON(fetcher, projectMetadataConfig.githubApi, {
      cache: "no-store",
      headers: githubHeaders,
      signal,
    }),
    fetchJSON(fetcher, projectMetadataConfig.npmDownloadsApi, {
      cache: "no-store",
      signal,
    }),
    fetchJSON(fetcher, projectMetadataConfig.npmRegistryApi, {
      cache: "no-store",
      signal,
    }),
  ]);

  const sources = {
    github: github !== null,
    npmDownloads: npmDownloads !== null,
    npmRegistry: npmRegistry !== null,
  };

  return {
    createdAt: normalizeDate(github?.created_at),
    downloadsLastWeek: normalizeCount(npmDownloads?.downloads),
    fetchedAt: successfulSourceCount(sources) > 0 ? now().toISOString() : null,
    latestVersion: normalizeVersion(npmRegistry?.version),
    license: normalizeLicense(github?.license),
    sources,
    stars: normalizeCount(github?.stargazers_count),
  };
};

export const mergeProjectMetadataSnapshots = (
  current: ProjectMetadataSnapshot,
  refreshed: ProjectMetadataSnapshot,
): ProjectMetadataSnapshot => {
  const { github, npmDownloads, npmRegistry } = refreshed.sources;
  const hasRefresh = successfulSourceCount(refreshed.sources) > 0;

  return {
    createdAt: github ? refreshed.createdAt : current.createdAt,
    downloadsLastWeek: npmDownloads
      ? refreshed.downloadsLastWeek
      : current.downloadsLastWeek,
    fetchedAt: hasRefresh ? refreshed.fetchedAt : current.fetchedAt,
    latestVersion: npmRegistry
      ? refreshed.latestVersion
      : current.latestVersion,
    license: github ? refreshed.license : current.license,
    sources: {
      github: github || current.sources.github,
      npmDownloads: npmDownloads || current.sources.npmDownloads,
      npmRegistry: npmRegistry || current.sources.npmRegistry,
    },
    stars: github ? refreshed.stars : current.stars,
  };
};

const timestamp = (value: string | null) =>
  value === null ? Number.NEGATIVE_INFINITY : Date.parse(value);

export const preferNewerProjectMetadata = (
  first: ProjectMetadataSnapshot,
  second: ProjectMetadataSnapshot,
) =>
  timestamp(second.fetchedAt) > timestamp(first.fetchedAt) ? second : first;

export const isProjectMetadataFresh = (
  snapshot: ProjectMetadataSnapshot,
  maxAgeMilliseconds: number,
  now = Date.now(),
) => {
  const fetchedAt = timestamp(snapshot.fetchedAt);
  return (
    Number.isFinite(fetchedAt) &&
    maxAgeMilliseconds >= 0 &&
    now - fetchedAt >= -60_000 &&
    now - fetchedAt < maxAgeMilliseconds
  );
};

export const projectAgeInYears = (
  createdAt: string | null,
  now = new Date(),
): number | null => {
  if (createdAt === null || !isValidDate(createdAt)) return null;

  const created = new Date(createdAt);
  let years = now.getUTCFullYear() - created.getUTCFullYear();
  const beforeAnniversary =
    now.getUTCMonth() < created.getUTCMonth() ||
    (now.getUTCMonth() === created.getUTCMonth() &&
      now.getUTCDate() < created.getUTCDate());

  if (beforeAnniversary) years -= 1;
  return Math.max(years, 0);
};

export const releaseUrlForVersion = (version: string | null) => {
  const normalizedVersion = normalizeVersion(version);
  return normalizedVersion === null
    ? null
    : `${projectMetadataConfig.repository}/releases/tag/magic-modal-${encodeURIComponent(normalizedVersion)}`;
};

export const deriveProjectMetadata = (
  snapshot: ProjectMetadataSnapshot,
  now = new Date(),
): ProjectMetadata => {
  const created =
    snapshot.createdAt === null ? null : new Date(snapshot.createdAt);
  const createdYear =
    created === null || Number.isNaN(created.valueOf())
      ? null
      : created.getUTCFullYear();

  return {
    ...snapshot,
    ageYears: projectAgeInYears(snapshot.createdAt, now),
    createdYear,
    releaseUrl: releaseUrlForVersion(snapshot.latestVersion),
    versionLabel:
      snapshot.latestVersion === null ? null : `v${snapshot.latestVersion}`,
  };
};

export const formatProjectCount = (value: number | null) =>
  value === null ? null : new Intl.NumberFormat("en-US").format(value);

export const parseProjectMetadataCache = (
  value: string | null,
): ProjectMetadataSnapshot | null => {
  if (value === null) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isProjectMetadataSnapshot(parsed)) return null;
    if (
      parsed.fetchedAt !== null &&
      Date.parse(parsed.fetchedAt) > Date.now() + 5 * 60 * 1_000
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};
