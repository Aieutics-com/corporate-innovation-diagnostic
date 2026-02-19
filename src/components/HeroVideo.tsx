"use client";

import { useRef, useCallback } from "react";

const MAX_LOOPS = 3;

export default function HeroVideo() {
  const loopCount = useRef(0);

  const handleEnded = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      loopCount.current += 1;
      if (loopCount.current < MAX_LOOPS) {
        e.currentTarget.play();
      }
    },
    []
  );

  return (
    <video
      className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none"
      src="/hero-bg.mp4"
      autoPlay
      muted
      playsInline
      onEnded={handleEnded}
    />
  );
}
