"use client";

import { useEffect } from "react";

export const HomeEffects = () => {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-magic-home]");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const revealTargets = root.querySelectorAll<HTMLElement>("[data-reveal]");

    root.classList.add("mm-effects-ready");

    let observer: IntersectionObserver | undefined;
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      for (const target of revealTargets) target.classList.add("is-visible");
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      for (const target of revealTargets) observer.observe(target);
    }

    let frame = 0;
    const updatePointer = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        root.style.setProperty("--mm-pointer-x", x.toFixed(4));
        root.style.setProperty("--mm-pointer-y", y.toFixed(4));
      });
    };
    const resetPointer = () => {
      root.style.setProperty("--mm-pointer-x", "0");
      root.style.setProperty("--mm-pointer-y", "0");
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetPointer);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", updatePointer);
      document.documentElement.removeEventListener("mouseleave", resetPointer);
      root.classList.remove("mm-effects-ready");
    };
  }, []);

  return null;
};
