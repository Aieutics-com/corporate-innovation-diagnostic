"use client";

import { track } from "@vercel/analytics";
import { useCallback } from "react";

export default function DownloadPDFButton() {
  const handleDownload = useCallback(() => {
    track("download_pdf");
    window.print();
  }, []);

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold font-[family-name:var(--font-heading)] border border-[var(--color-grey-light)] rounded-xl text-[var(--color-grey)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-all duration-200 cursor-pointer"
    >
      Download PDF
    </button>
  );
}
