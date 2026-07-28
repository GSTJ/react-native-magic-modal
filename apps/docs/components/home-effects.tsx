"use client";

import { useLayoutEffect } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const HomeEffects = () => {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-magic-home]");
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const one = <T extends HTMLElement>(selector: string) =>
      root.querySelector<T>(selector);
    const many = <T extends HTMLElement>(selector: string) => [
      ...root.querySelectorAll<T>(selector),
    ];
    const revealTargets = many<HTMLElement>("[data-reveal]");

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(
        "(prefers-reduced-motion: reduce)",
        () => {
          gsap.set(revealTargets, {
            clearProps:
              "opacity,transform,visibility,filter,clipPath,willChange",
          });
          gsap.set(root, {
            "--mm-pointer-x": 0,
            "--mm-pointer-y": 0,
          });
        },
        root,
      );

      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const hero = one<HTMLElement>(".mm-hero");
          const flowCode = one<HTMLElement>(".mm-flow-code");
          const nativeStage = one<HTMLElement>(".mm-native-stage");

          if (hero) {
            const heroTimeline = gsap.timeline({
              defaults: { ease: "power3.out" },
            });
            const heroCopy = [
              one<HTMLElement>(".mm-overline"),
              one<HTMLElement>(".mm-hero h1"),
              one<HTMLElement>(".mm-hero-lede"),
              one<HTMLElement>(".mm-hero-actions"),
              one<HTMLElement>(".mm-hero-copy > .mh-install-command"),
            ].filter((target): target is HTMLElement => target !== null);
            const codeChrome = many<HTMLElement>(
              ".mm-flow-code-head, .mm-flow-code-body, .mm-flow-promise",
            );
            const stageChrome = many<HTMLElement>(
              ".mm-stage-meta, .mm-native-surface, .mm-stage-footer",
            );

            heroTimeline
              .from(heroCopy, {
                autoAlpha: 0,
                duration: 0.72,
                stagger: 0.08,
                y: 20,
              })
              .from(
                ".mm-flow-four",
                {
                  autoAlpha: 0,
                  duration: 1.05,
                  rotation: -9,
                  scale: 0.88,
                },
                0.08,
              );

            if (flowCode) {
              heroTimeline
                .fromTo(
                  flowCode,
                  {
                    autoAlpha: 0,
                    clipPath: "inset(0 100% 0 0)",
                  },
                  {
                    autoAlpha: 1,
                    clipPath: "inset(0 0% 0 0)",
                    duration: 0.92,
                    ease: "expo.out",
                    onComplete: () =>
                      gsap.set(flowCode, { clearProps: "clipPath" }),
                  },
                  0.2,
                )
                .from(
                  codeChrome,
                  {
                    autoAlpha: 0,
                    duration: 0.5,
                    stagger: 0.07,
                    x: -16,
                  },
                  0.5,
                );
            }

            heroTimeline.from(
              ".mm-flow-tether span, .mm-flow-tether i",
              {
                duration: 0.55,
                scale: 0,
                stagger: 0.08,
                transformOrigin: "left center",
              },
              0.74,
            );

            if (nativeStage) {
              heroTimeline
                .fromTo(
                  nativeStage,
                  {
                    autoAlpha: 0,
                    clipPath: "inset(100% 0 0 0)",
                  },
                  {
                    autoAlpha: 1,
                    clipPath: "inset(0% 0 0 0)",
                    duration: 1.05,
                    ease: "expo.out",
                    onComplete: () =>
                      gsap.set(nativeStage, { clearProps: "clipPath" }),
                  },
                  0.34,
                )
                .from(
                  stageChrome,
                  {
                    autoAlpha: 0,
                    duration: 0.58,
                    stagger: 0.08,
                    y: 18,
                  },
                  0.68,
                );
            }
          }

          const request = one<HTMLElement>(".mm-request");
          const proof = one<HTMLElement>(".mm-proof");

          if (proof) {
            gsap.from(".mm-proof a", {
              autoAlpha: 0,
              duration: 0.72,
              ease: "power3.out",
              scrollTrigger: {
                once: true,
                start: "top 92%",
                trigger: proof,
              },
              stagger: 0.08,
              y: 20,
            });
          }

          if (request) {
            const requestTimeline = gsap.timeline({
              defaults: { duration: 0.8, ease: "power3.out" },
              scrollTrigger: {
                invalidateOnRefresh: true,
                once: true,
                start: "top 78%",
                trigger: request,
              },
            });
            const requestFlags = one<HTMLElement>(".mm-request-flags");

            requestTimeline
              .from(".mm-request-index > span", {
                autoAlpha: 0,
                x: -18,
              })
              .from(
                ".mm-request-index strong",
                {
                  autoAlpha: 0,
                  duration: 0.95,
                  rotation: -10,
                  scale: 0.55,
                },
                0.02,
              )
              .from(".mm-request-copy > p", { autoAlpha: 0, y: 34 }, 0.12)
              .from(".mm-request-copy aside", { autoAlpha: 0, x: -24 }, 0.32);

            if (requestFlags) {
              requestTimeline
                .from(
                  requestFlags,
                  {
                    autoAlpha: 0,
                    duration: 0.9,
                    rotation: -4,
                    scale: 0.94,
                  },
                  0.2,
                )
                .from(
                  ".mm-request-flags code",
                  {
                    autoAlpha: 0,
                    duration: 0.46,
                    stagger: 0.07,
                    x: -18,
                  },
                  0.48,
                )
                .from(
                  ".mm-request-flags > span",
                  { autoAlpha: 0, duration: 0.45, y: 10 },
                  0.72,
                );
            }
          }

          const examples = one<HTMLElement>(".mm-examples");
          if (examples) {
            gsap
              .timeline({
                defaults: { duration: 0.78, ease: "power3.out" },
                scrollTrigger: {
                  invalidateOnRefresh: true,
                  once: true,
                  start: "top 76%",
                  trigger: examples,
                },
              })
              .from(".mm-examples > header > span", {
                autoAlpha: 0,
                x: -18,
              })
              .from(
                ".mm-examples > header h2, .mm-examples > header p",
                {
                  autoAlpha: 0,
                  stagger: 0.1,
                  y: 28,
                },
                0.08,
              )
              .from(
                ".mm-example-tabs button",
                {
                  autoAlpha: 0,
                  duration: 0.56,
                  stagger: 0.08,
                  x: -22,
                },
                0.28,
              )
              .from(
                ".mm-example-panel",
                {
                  autoAlpha: 0,
                  clipPath: "inset(0 0 100% 0)",
                  duration: 0.94,
                  ease: "expo.out",
                },
                0.3,
              );
          }

          const show = one<HTMLElement>(".mm-show");
          if (show) {
            const showObject = one<HTMLElement>(".mm-show-object");
            const showTimeline = gsap.timeline({
              defaults: { duration: 0.82, ease: "power3.out" },
              scrollTrigger: {
                invalidateOnRefresh: true,
                once: true,
                start: "top 74%",
                trigger: show,
              },
            });

            showTimeline
              .from(".mm-show-heading > span", {
                autoAlpha: 0,
                x: -18,
              })
              .from(
                ".mm-show-heading h2, .mm-show-heading p",
                {
                  autoAlpha: 0,
                  stagger: 0.1,
                  y: 28,
                },
                0.08,
              );

            if (showObject) {
              showTimeline
                .fromTo(
                  showObject,
                  {
                    autoAlpha: 0,
                    clipPath: "inset(0 0 100% 0)",
                  },
                  {
                    autoAlpha: 1,
                    clipPath: "inset(0 0 0% 0)",
                    duration: 0.95,
                    ease: "expo.out",
                    onComplete: () =>
                      gsap.set(showObject, { clearProps: "clipPath" }),
                  },
                  0.18,
                )
                .from(
                  ".mm-show-object pre b, .mm-show-object-tag",
                  {
                    autoAlpha: 0,
                    duration: 0.42,
                    stagger: 0.08,
                    y: 9,
                  },
                  0.58,
                );
            }

            showTimeline
              .from(
                ".mm-show-ledger > div",
                {
                  autoAlpha: 0,
                  duration: 0.72,
                  stagger: 0.13,
                  x: 46,
                },
                0.48,
              )
              .from(
                ".mm-show-ledger dt span",
                {
                  autoAlpha: 0,
                  duration: 0.48,
                  scale: 0.55,
                  stagger: 0.13,
                },
                0.62,
              )
              .from(
                ".mm-update-note",
                { autoAlpha: 0, duration: 0.58, x: -20 },
                0.86,
              );
          }

          const history = one<HTMLElement>(".mm-history");
          if (history) {
            const historyTimeline = gsap.timeline({
              defaults: { duration: 0.78, ease: "power3.out" },
              scrollTrigger: {
                invalidateOnRefresh: true,
                once: true,
                start: "top 76%",
                trigger: history,
              },
            });

            historyTimeline
              .from(".mm-history-heading > span", {
                autoAlpha: 0,
                x: -18,
              })
              .from(
                ".mm-history-heading h2, .mm-history-heading p",
                {
                  autoAlpha: 0,
                  stagger: 0.1,
                  y: 28,
                },
                0.08,
              )
              .from(
                ".mm-history-list li",
                {
                  autoAlpha: 0,
                  duration: 0.76,
                  stagger: 0.15,
                  x: (index) => (index % 2 === 0 ? -34 : 34),
                },
                0.34,
              )
              .from(
                ".mm-history-year",
                {
                  duration: 0.68,
                  rotation: -7,
                  scale: 0.72,
                  stagger: 0.15,
                },
                0.4,
              );
          }

          const finalSection = one<HTMLElement>(".mm-final");
          if (finalSection) {
            const finalTimeline = gsap.timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: {
                invalidateOnRefresh: true,
                once: true,
                start: "top 72%",
                trigger: finalSection,
              },
            });

            finalTimeline
              .from(".mm-fifth-sheet i", {
                duration: 1.08,
                ease: "back.out(1.18)",
                rotation: (index) => (index - 2) * 4,
                stagger: 0.11,
                yPercent: 115,
              })
              .from(
                ".mm-fifth-sheet span",
                {
                  autoAlpha: 0,
                  duration: 0.9,
                  rotation: -8,
                  scale: 0.68,
                },
                0.42,
              )
              .from(
                ".mm-final-copy > span",
                { autoAlpha: 0, duration: 0.55, x: -18 },
                0.18,
              )
              .from(
                ".mm-final-copy h2",
                { autoAlpha: 0, duration: 0.85, y: 32 },
                0.26,
              )
              .from(
                ".mm-final-copy > p, .mm-final-copy > div",
                {
                  autoAlpha: 0,
                  duration: 0.68,
                  stagger: 0.1,
                  y: 20,
                },
                0.52,
              );
          }
        },
        root,
      );

      const ownerTraversal = (portalAxis: "x" | "y") => {
        const owner = one<HTMLElement>(".mm-owner");
        if (!owner) return;

        const firstRoute = one<HTMLElement>(".mm-owner-route:not(.is-portal)");
        const portalRoute = one<HTMLElement>(".mm-owner-route.is-portal");
        const ownerTimeline = gsap.timeline({
          defaults: { duration: 0.72, ease: "power3.out" },
          scrollTrigger: {
            invalidateOnRefresh: true,
            once: true,
            start: "top 72%",
            trigger: owner,
          },
        });

        ownerTimeline
          .from(".mm-section-copy > *", {
            autoAlpha: 0,
            stagger: 0.09,
            x: -28,
          })
          .from(".mm-owner-callers > span", { autoAlpha: 0, x: -16 }, 0.14)
          .from(
            ".mm-owner-callers code",
            {
              autoAlpha: 0,
              duration: 0.48,
              stagger: 0.07,
              x: -22,
            },
            0.24,
          );

        if (firstRoute) {
          ownerTimeline.from(
            firstRoute.querySelector("i"),
            {
              duration: 0.52,
              scaleX: 0,
              transformOrigin: "left center",
            },
            0.52,
          );
        }

        ownerTimeline
          .from(
            ".mm-owner-function",
            {
              autoAlpha: 0,
              clipPath: "inset(0 100% 0 0)",
              duration: 0.72,
            },
            0.67,
          )
          .from(
            ".mm-owner-function > *",
            { autoAlpha: 0, duration: 0.42, stagger: 0.07, y: 10 },
            0.82,
          );

        if (portalRoute) {
          ownerTimeline.from(
            portalRoute.querySelector("i"),
            portalAxis === "y"
              ? {
                  duration: 0.55,
                  scaleY: 0,
                  transformOrigin: "center top",
                }
              : {
                  duration: 0.55,
                  scaleX: 0,
                  transformOrigin: "left center",
                },
            1.02,
          );
        }

        ownerTimeline
          .from(
            ".mm-owner-portal > div:first-child",
            { autoAlpha: 0, duration: 0.62, y: 18 },
            1.12,
          )
          .from(
            ".mm-owner-sheet-stack i",
            {
              autoAlpha: 0,
              duration: 0.72,
              stagger: 0.09,
              y: 74,
            },
            1.25,
          );
      };

      const closeTraversal = (pathAxis: "x" | "y") => {
        const close = one<HTMLElement>(".mm-close");
        if (!close) return;

        const resultPath = one<HTMLElement>(".mm-result-path span");
        const closeTimeline = gsap.timeline({
          defaults: { duration: 0.76, ease: "power3.out" },
          scrollTrigger: {
            invalidateOnRefresh: true,
            once: true,
            start: "top 73%",
            trigger: close,
          },
        });

        closeTimeline
          .from(".mm-close-heading > *", {
            autoAlpha: 0,
            stagger: 0.09,
            x: -26,
          })
          .from(
            ".mm-result-controls > span, .mm-result-controls button",
            {
              autoAlpha: 0,
              duration: 0.42,
              stagger: 0.05,
              y: 12,
            },
            0.2,
          )
          .from(
            ".mm-result-sheet",
            { autoAlpha: 0, duration: 0.78, y: 76 },
            0.36,
          );

        if (resultPath) {
          closeTimeline.from(
            resultPath,
            pathAxis === "y"
              ? {
                  duration: 0.55,
                  scaleY: 0,
                  transformOrigin: "center top",
                }
              : {
                  duration: 0.55,
                  scaleX: 0,
                  transformOrigin: "left center",
                },
            0.72,
          );
        }

        closeTimeline
          .from(".mm-result-path i", { duration: 0.38, scale: 0 }, 1.05)
          .from(
            ".mm-result-receipt",
            { autoAlpha: 0, duration: 0.82, x: 48 },
            0.9,
          );
      };

      media.add(
        "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
        () => {
          ownerTraversal("x");
          closeTraversal("x");

          const hero = one<HTMLElement>(".mm-hero");
          const flowCode = one<HTMLElement>(".mm-flow-code");
          const nativeStage = one<HTMLElement>(".mm-native-stage");
          if (!hero || !flowCode || !nativeStage) return;

          // The existing CSS variables already move the origin and native
          // surfaces in opposite directions. ScrollTrigger drives those same
          // variables so the call site separates from its portal as the story
          // gives way to the next section.
          gsap.set([flowCode, nativeStage], { transition: "none" });
          gsap.fromTo(
            root,
            {
              "--mm-pointer-x": 0,
              "--mm-pointer-y": 0,
            },
            {
              "--mm-pointer-x": 0.92,
              "--mm-pointer-y": -0.68,
              ease: "none",
              scrollTrigger: {
                end: "bottom top",
                invalidateOnRefresh: true,
                scrub: 0.75,
                start: "top top",
                trigger: hero,
              },
            },
          );
        },
        root,
      );

      media.add(
        "(max-width: 700px) and (prefers-reduced-motion: no-preference)",
        () => {
          ownerTraversal("y");
          closeTraversal("y");
          gsap.set(root, {
            "--mm-pointer-x": 0,
            "--mm-pointer-y": 0,
          });
        },
        root,
      );
    }, root);

    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      media.revert();
      context.revert();
    };
  }, []);

  return null;
};
