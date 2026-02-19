"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-3">
              Something went wrong
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-4">
              Unable to load the diagnostic
            </h2>
            <p className="font-[family-name:var(--font-body)] text-[var(--color-grey)] mb-8">
              An unexpected error occurred. Please reload the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-[var(--color-orange)] text-white font-[family-name:var(--font-heading)] font-bold text-sm px-8 py-3 rounded-xl hover:shadow-[0_0_30px_rgba(255,95,31,0.3)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
