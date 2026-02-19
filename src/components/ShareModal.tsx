"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import type { DimensionResult } from "@/lib/diagnostic-data";
import type { Answers } from "@/lib/scoring";
import { encodeAnswers } from "@/lib/share";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  results: DimensionResult[];
  answers: Answers;
  notionPageId: string | null;
}

type ModalState = "form" | "loading" | "success" | "error";

export default function ShareModal({
  open,
  onClose,
  results,
  answers,
  notionPageId,
}: ShareModalProps) {
  const [state, setState] = useState<ModalState>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initiativeName, setInitiativeName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  // Focus first field on open
  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setState("form");
        setErrorMsg("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !email.trim() || !initiativeName.trim()) {
      setErrorMsg("Please fill in all fields.");
      setState("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      setState("error");
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      const encoded = encodeAnswers(answers);
      const shareUrl = `${window.location.origin}/diagnostic?r=${encoded}`;

      if (notionPageId) {
        const res = await fetch("/api/submit/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: notionPageId,
            name: name.trim(),
            email: email.trim(),
            projectName: initiativeName.trim(),
            shareUrl,
          }),
        });

        if (!res.ok) {
          throw new Error("Save failed");
        }
      }

      track("results_recorded");
      setState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }, [name, email, initiativeName, answers, notionPageId]);

  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const showError = state === "error" && errorMsg;

  // Suppress unused variable warnings for props used only in dependency arrays
  void results;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-6
        transition-all duration-250 ease-out
        ${open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
      `}
      style={{ background: "rgba(26, 26, 26, 0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`
          bg-[var(--color-white)] rounded-2xl w-full max-w-md
          shadow-[0_25px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)]
          transition-transform duration-300
          ${open ? "scale-100 translate-y-0" : "scale-[0.97] translate-y-3"}
        `}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        <div className="p-8">
          {!isSuccess ? (
            <>
              <h3
                id="share-modal-title"
                className="font-[family-name:var(--font-heading)] text-xl font-bold mb-1"
              >
                Record Your Results
              </h3>
              <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-grey)] mb-7">
                Save your diagnostic profile and receive follow-up insights
              </p>

              <div className="mb-5">
                <label className="block font-[family-name:var(--font-heading)] text-[0.8rem] font-bold mb-1.5">
                  Your name
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jean Dupont"
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-[0.9rem] font-[family-name:var(--font-body)] border border-[var(--color-grey-light)] rounded-xl bg-[var(--color-white)] text-[var(--color-foreground)] outline-none transition-all duration-200 placeholder:text-[var(--color-grey-lighter)] focus:border-[var(--color-orange)] focus:shadow-[0_0_0_3px_rgba(255,95,31,0.12)] disabled:bg-[var(--color-tag-bg)] disabled:text-[var(--color-grey)] disabled:cursor-not-allowed"
                />
              </div>

              <div className="mb-5">
                <label className="block font-[family-name:var(--font-heading)] text-[0.8rem] font-bold mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-[0.9rem] font-[family-name:var(--font-body)] border border-[var(--color-grey-light)] rounded-xl bg-[var(--color-white)] text-[var(--color-foreground)] outline-none transition-all duration-200 placeholder:text-[var(--color-grey-lighter)] focus:border-[var(--color-orange)] focus:shadow-[0_0_0_3px_rgba(255,95,31,0.12)] disabled:bg-[var(--color-tag-bg)] disabled:text-[var(--color-grey)] disabled:cursor-not-allowed"
                />
              </div>

              <div className="mb-5">
                <label className="block font-[family-name:var(--font-heading)] text-[0.8rem] font-bold mb-1.5">
                  Initiative name
                </label>
                <input
                  type="text"
                  value={initiativeName}
                  onChange={(e) => setInitiativeName(e.target.value)}
                  placeholder="e.g. Supply Chain Optimisation Initiative"
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-[0.9rem] font-[family-name:var(--font-body)] border border-[var(--color-grey-light)] rounded-xl bg-[var(--color-white)] text-[var(--color-foreground)] outline-none transition-all duration-200 placeholder:text-[var(--color-grey-lighter)] focus:border-[var(--color-orange)] focus:shadow-[0_0_0_3px_rgba(255,95,31,0.12)] disabled:bg-[var(--color-tag-bg)] disabled:text-[var(--color-grey)] disabled:cursor-not-allowed"
                />
              </div>

              <p className="text-[0.7rem] text-[var(--color-grey)] leading-relaxed mb-5">
                Your details are stored securely to deliver follow-up insights and help us improve the diagnostic.
              </p>

              {showError && (
                <p className="text-[0.8rem] text-[var(--color-red)] mb-4">
                  {errorMsg}
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`
                  w-full py-3.5 font-[family-name:var(--font-heading)] text-[0.9rem] font-bold
                  text-white bg-[var(--color-orange)] border-none rounded-xl cursor-pointer
                  transition-all duration-300
                  hover:shadow-[0_0_30px_rgba(255,95,31,0.3)] hover:scale-[1.01]
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100
                  ${isLoading ? "animate-pulse" : ""}
                `}
              >
                {isLoading ? "Saving..." : "Save Results"}
              </button>

              <button
                onClick={onClose}
                className="block w-full text-center mt-4 font-[family-name:var(--font-heading)] text-[0.8rem] font-bold text-[var(--color-grey)] bg-transparent border-none cursor-pointer hover:text-[var(--color-foreground)] transition-colors duration-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[rgba(90,154,110,0.12)] inline-flex items-center justify-center mb-5">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5a9a6e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-[family-name:var(--font-heading)] text-lg font-bold mb-2">
                Results recorded!
              </p>
              <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-grey)] leading-relaxed mb-6">
                Your diagnostic profile has been saved. We&apos;ll be in touch with follow-up insights at{" "}
                <strong className="text-[var(--color-foreground)]">{email}</strong>.
              </p>
              <button
                onClick={onClose}
                className="inline-block px-10 py-3 font-[family-name:var(--font-heading)] text-sm font-bold border border-[var(--color-grey-light)] rounded-xl bg-transparent text-[var(--color-foreground)] cursor-pointer hover:border-[var(--color-foreground)] hover:bg-[var(--color-tag-bg)] transition-all duration-200"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
