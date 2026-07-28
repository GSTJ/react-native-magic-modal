"use client";

import type { ReactNode } from "react";

import { formatProjectCount } from "@/lib/project-metadata";

import { useProjectMetadata } from "./project-metadata-provider";

type ProjectMetadataValueProps = {
  fallback?: ReactNode;
};

const valueOrFallback = (value: ReactNode | null, fallback: ReactNode) => (
  <>{value ?? fallback}</>
);

export const ProjectStars = ({
  fallback = null,
}: ProjectMetadataValueProps) => {
  const { metadata } = useProjectMetadata();
  return valueOrFallback(formatProjectCount(metadata.stars), fallback);
};

export const ProjectWeeklyDownloads = ({
  fallback = null,
}: ProjectMetadataValueProps) => {
  const { metadata } = useProjectMetadata();
  return valueOrFallback(
    formatProjectCount(metadata.downloadsLastWeek),
    fallback,
  );
};

export const ProjectVersion = ({
  fallback = null,
}: ProjectMetadataValueProps) => {
  const { metadata } = useProjectMetadata();
  return valueOrFallback(metadata.versionLabel, fallback);
};

export const ProjectLicense = ({
  fallback = null,
}: ProjectMetadataValueProps) => {
  const { metadata } = useProjectMetadata();
  return valueOrFallback(metadata.license, fallback);
};

export const ProjectAge = ({ fallback = null }: ProjectMetadataValueProps) => {
  const { metadata } = useProjectMetadata();
  const age =
    metadata.createdYear === null ? null : `since ${metadata.createdYear}`;
  return valueOrFallback(age, fallback);
};
