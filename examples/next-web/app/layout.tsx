import type { ReactNode } from "react";

import type { Metadata } from "next";

import "./styles.css";

export const metadata: Metadata = {
  title: "Magic Modal · Next.js consumer",
  description: "A real Next.js consumer fixture for React Native Magic Modal.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
