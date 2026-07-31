import type { NextConfig } from "next";

// Deliberately bare. The browser entry renders DOM elements and imports nothing
// but `react`, so no alias, no `.web.*` extension order, and no transpile list
// holds this fixture up. If any of that has to come back, the package
// regressed.
const config = {
  reactStrictMode: true,
} satisfies NextConfig;

export default config;
