import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { MagicMark } from "@/components/magic-mark";

export default function NotFound() {
  return (
    <main className="not-found">
      <MagicMark size={56} />
      <span>404 · spell fizzled</span>
      <h1>This page escaped the modal stack.</h1>
      <p>
        The API probably moved. Search the new reference or head back to the
        docs.
      </p>
      <Link href="/docs">
        <ArrowLeft size={16} />
        Back to documentation
      </Link>
    </main>
  );
}
