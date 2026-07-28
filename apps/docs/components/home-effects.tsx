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
      ".mm-overline, .mm-hero h1, .mm-hero-lede, .mm-hero-actions, .mm-hero-copy > .mh-install-command",
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
              autoAlpha: 0,
              duration: 0.7,
              stagger: 0.07,
              y: 18,
            })
            .from(
              ".mm-flow-four",
              {
                autoAlpha: 0,
                duration: 0.9,
                rotation: -6,
                scale: 0.92,
              },
              0.06,
            )
            .from(
              ".mm-flow-code",
              {
                autoAlpha: 0,
                duration: 0.82,
                ease: "expo.out",
                x: -24,
              },
              0.16,
            )
            .from(
              ".mm-native-stage",
              {
                autoAlpha: 0,
                duration: 0.9,
                ease: "expo.out",
                x: 24,
                y: 16,
              },
              0.22,
            );
        },
        root,
      );

      media.add(
        "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(revealTargets, {
            opacity: 0,
            y: 24,
          });

          ScrollTrigger.batch(revealTargets, {
            interval: 0.08,
            once: true,
            onEnter: (targets) => {
              gsap.to(targets, {
                duration: 0.66,
                ease: "power3.out",
                opacity: 1,
                stagger: 0.06,
                y: 0,
              });
            },
            start: "top 88%",
          });
        },
        root,
      );

      media.add(
        "(max-width: 700px)",
        () => {
          gsap.set(
            [
              ...heroTargets,
              ...revealTargets,
              ".mm-flow-four",
              ".mm-flow-code",
              ".mm-native-stage",
            ],
            {
              clearProps:
                "opacity,transform,visibility,filter,clipPath,willChange",
            },
          );
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
