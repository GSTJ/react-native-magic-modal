"use client";

import { useLayoutEffect } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const HomeEffects = () => {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-magic-home]");
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const many = <T extends HTMLElement>(selector: string) => [
      ...root.querySelectorAll<T>(selector),
    ];
    const revealTargets = many<HTMLElement>("[data-reveal]");
    const heroTargets = many<HTMLElement>(
      ".mm-overline, .mm-hero h1, .mm-hero-lede, .mm-hero-actions, .mm-hero-copy > .mh-install",
    );
    const media = gsap.matchMedia();

    const context = gsap.context(() => {
      media.add(
        "(prefers-reduced-motion: reduce)",
        () => {
          gsap.set([...heroTargets, ...revealTargets], {
            clearProps:
              "opacity,transform,visibility,filter,clipPath,willChange",
          });
        },
        root,
      );

      media.add(
        "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(heroTargets, {
              duration: 0.7,
              stagger: 0.07,
              y: 18,
            });
        },
        root,
      );

      media.add(
        "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
        () => {
          ScrollTrigger.batch(revealTargets, {
            interval: 0.08,
            once: true,
            onEnter: (targets) => {
              gsap.fromTo(
                targets,
                { opacity: 0, y: 24 },
                {
                  clearProps: "opacity,transform",
                  duration: 0.66,
                  ease: "power3.out",
                  opacity: 1,
                  stagger: 0.06,
                  y: 0,
                },
              );
            },
            start: "top 88%",
          });
        },
        root,
      );

      media.add(
        "(max-width: 700px)",
        () => {
          gsap.set([...heroTargets, ...revealTargets], {
            clearProps:
              "opacity,transform,visibility,filter,clipPath,willChange",
          });
        },
        root,
      );
    }, root);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return null;
};
