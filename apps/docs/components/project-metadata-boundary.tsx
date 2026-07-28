import type { ReactNode } from "react";

import { getProjectMetadataSnapshot } from "@/lib/project-metadata.server";

import { ProjectMetadataProvider } from "./project-metadata-provider";

type ProjectMetadataBoundaryProps = {
  children: ReactNode;
  maxAgeMilliseconds?: number;
};

export const ProjectMetadataBoundary = async ({
  children,
  maxAgeMilliseconds,
}: ProjectMetadataBoundaryProps) => {
  const initialSnapshot = await getProjectMetadataSnapshot();

  return (
    <ProjectMetadataProvider
      initialSnapshot={initialSnapshot}
      maxAgeMilliseconds={maxAgeMilliseconds}
    >
      {children}
    </ProjectMetadataProvider>
  );
};
