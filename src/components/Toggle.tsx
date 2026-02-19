"use client";

import { useCallback, useRef } from "react";

interface ToggleProps {
  questionId: number;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export default function Toggle({ questionId, value, onChange }: ToggleProps) {
  const name = `q-${questionId}`;
  const yesRef = useRef<HTMLLabelElement>(null);
  const noRef = useRef<HTMLLabelElement>(null);

  const spawnRipple = useCallback((label: HTMLLabelElement | null) => {
    if (!label) return;
    const size = Math.max(label.offsetWidth, label.offsetHeight);
    const span = document.createElement("span");
    Object.assign(span.style, {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      left: `${(label.offsetWidth - size) / 2}px`,
      top: `${(label.offsetHeight - size) / 2}px`,
      borderRadius: "50%",
      backgroundColor: "#FF5F1F",
      pointerEvents: "none",
      zIndex: "1",
      animation: "ripple-expand 300ms ease-out forwards",
    });
    label.appendChild(span);
    setTimeout(() => span.remove(), 350);
  }, []);

  return (
    <fieldset
      className="relative inline-flex rounded-lg bg-[var(--color-tag-bg)] p-1"
      role="radiogroup"
      aria-label="Answer"
    >
      {/* Sliding highlight pill */}
      {value !== null && (
        <div
          className="absolute top-1 bottom-1 rounded-md transition-all duration-200 ease-out"
          style={{
            left: value === true ? "4px" : "50%",
            right: value === true ? "50%" : "4px",
            backgroundColor: value === true ? "#FF5F1F" : "#1a1a1a",
          }}
        />
      )}

      {/* Yes option */}
      <label
        ref={yesRef}
        className={`
          relative z-10 flex items-center justify-center overflow-hidden
          px-6 py-2.5 rounded-md text-sm font-bold cursor-pointer
          font-[family-name:var(--font-heading)]
          transition-colors duration-200 select-none
          ${
            value === true
              ? "text-white"
              : "text-[var(--color-grey)] hover:text-[var(--color-orange)]"
          }
        `}
      >
        <input
          type="radio"
          name={name}
          value="yes"
          checked={value === true}
          onChange={() => {
            spawnRipple(yesRef.current);
            onChange(true);
          }}
          className="sr-only"
        />
        <span className="relative z-[2]">Yes</span>
      </label>

      {/* No option */}
      <label
        ref={noRef}
        className={`
          relative z-10 flex items-center justify-center overflow-hidden
          px-6 py-2.5 rounded-md text-sm font-bold cursor-pointer
          font-[family-name:var(--font-heading)]
          transition-colors duration-200 select-none
          ${
            value === false
              ? "text-white"
              : "text-[var(--color-grey)] hover:text-[var(--color-foreground)]"
          }
        `}
      >
        <input
          type="radio"
          name={name}
          value="no"
          checked={value === false}
          onChange={() => {
            spawnRipple(noRef.current);
            onChange(false);
          }}
          className="sr-only"
        />
        <span className="relative z-[2]">No</span>
      </label>
    </fieldset>
  );
}
