"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DUR, EASE } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

type MagneticButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** How far the button follows the cursor, 0-1. */
  strength?: number;
};

const BASE_CLASSES =
  "group relative inline-flex items-center justify-center rounded-full border border-accent px-7 py-3 text-sm font-medium text-ink outline-none transition-colors duration-base ease-out-expo hover:bg-accent hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/**
 * Pill button/link that pulls toward the cursor on hover and springs back on
 * leave. Disabled on touch devices and under reduced motion — it's just a
 * regular focusable button in those cases.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className,
  strength = 0.35,
}: MagneticButtonProps) {
  const Component = (href ? "a" : "button") as React.ElementType;
  const elRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(hover: hover) and (prefers-reduced-motion: no-preference)",
        () => {
          const el = elRef.current;
          const label = labelRef.current;
          if (!el) return;

          const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: EASE.out });
          const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: EASE.out });

          function onPointerMove(e: PointerEvent) {
            const rect = el!.getBoundingClientRect();
            const relX = e.clientX - (rect.left + rect.width / 2);
            const relY = e.clientY - (rect.top + rect.height / 2);
            xTo(relX * strength);
            yTo(relY * strength);
            gsap.to(label, { scale: 1.05, duration: DUR.fast, ease: EASE.out });
          }

          function onPointerLeave() {
            gsap.to(el, { x: 0, y: 0, duration: DUR.base, ease: EASE.elastic });
            gsap.to(label, {
              scale: 1,
              duration: DUR.base,
              ease: EASE.elastic,
            });
          }

          el.addEventListener("pointermove", onPointerMove);
          el.addEventListener("pointerleave", onPointerLeave);

          return () => {
            el.removeEventListener("pointermove", onPointerMove);
            el.removeEventListener("pointerleave", onPointerLeave);
            gsap.set(el, { x: 0, y: 0 });
            gsap.set(label, { scale: 1 });
          };
        }
      );

      // Touch devices / reduced motion: no listeners attached, so the
      // element stays at its natural position — a plain focusable button.

      return () => mm.revert();
    },
    { scope: elRef, dependencies: [strength] }
  );

  return (
    <Component
      ref={elRef}
      href={href}
      onClick={onClick}
      type={href ? undefined : "button"}
      className={`${BASE_CLASSES} ${className ?? ""}`.trim()}
    >
      <span ref={labelRef} className="inline-block will-change-transform">
        {children}
      </span>
    </Component>
  );
}
