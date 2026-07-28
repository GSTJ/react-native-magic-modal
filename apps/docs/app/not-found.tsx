import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { MagicMark } from "@/components/magic-mark";

export default function NotFound() {
  return (
    <main className="not-found">
      <MagicMark size={56} />
      <span>404</span>
      <h1>Page not found</h1>
      <p>
        This URL may have moved. Search the reference or return to the docs.
      </p>
      <Link href="/docs">
        <ArrowLeft size={16} />
        Back to documentation
      </Link>
    </main>
  );
}
