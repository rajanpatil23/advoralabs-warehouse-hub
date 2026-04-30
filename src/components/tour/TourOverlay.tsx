import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTour } from "@/components/tour/TourContext";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

type Rect = { top: number; left: number; width: number; height: number };

export function TourOverlay() {
  const { active, current, stepIndex, steps, next, prev, stop } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Track target element position
  useLayoutEffect(() => {
    if (!active || !current?.selector) {
      setRect(null);
      return;
    }
    let raf = 0;
    let attempts = 0;

    const measure = () => {
      const el = document.querySelector(current.selector!) as HTMLElement | null;
      if (!el) {
        attempts++;
        if (attempts < 30) {
          raf = window.requestAnimationFrame(measure);
        } else {
          setRect(null);
        }
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const interval = window.setInterval(measure, 400);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      window.clearInterval(interval);
    };
  }, [active, current]);

  if (!mounted || !active || !current) return null;

  const isCenter = !current.selector || current.placement === "center" || !rect;
  const padding = 8;
  const highlightStyle: React.CSSProperties | undefined = rect
    ? {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }
    : undefined;

  // Tooltip placement
  const tooltipWidth = 360;
  const tooltipStyle: React.CSSProperties = (() => {
    if (isCenter || !rect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: tooltipWidth,
      };
    }
    const placement = current.placement ?? "bottom";
    const margin = 16;
    let top = 0, left = 0;
    if (placement === "bottom") {
      top = rect.top + rect.height + margin;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (placement === "top") {
      top = rect.top - margin;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (placement === "right") {
      top = rect.top + rect.height / 2;
      left = rect.left + rect.width + margin;
    } else if (placement === "left") {
      top = rect.top + rect.height / 2;
      left = rect.left - tooltipWidth - margin;
    }
    // clamp to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    left = Math.max(12, Math.min(left, vw - tooltipWidth - 12));
    top = Math.max(12, Math.min(top, vh - 220));
    const transform = placement === "top" ? "translateY(-100%)"
      : placement === "left" || placement === "right" ? "translateY(-50%)"
      : undefined;
    return { top, left, width: tooltipWidth, transform };
  })();

  const placement = current.placement ?? "bottom";

  // Arrow position relative to tooltip
  const arrowStyle: React.CSSProperties | null = (() => {
    if (isCenter || !rect) return null;
    const base: React.CSSProperties = {
      position: "absolute",
      width: 14,
      height: 14,
      background: "hsl(var(--card))",
      borderTop: "1px solid hsl(var(--border))",
      borderLeft: "1px solid hsl(var(--border))",
    };
    if (placement === "bottom") {
      // tooltip below target -> arrow on top of tooltip
      return { ...base, top: -8, left: "50%", transform: "translateX(-50%) rotate(45deg)" };
    }
    if (placement === "top") {
      return { ...base, bottom: -8, left: "50%", transform: "translateX(-50%) rotate(225deg)" };
    }
    if (placement === "right") {
      return { ...base, left: -8, top: "50%", transform: "translateY(-50%) rotate(-45deg)" };
    }
    if (placement === "left") {
      return { ...base, right: -8, top: "50%", transform: "translateY(-50%) rotate(135deg)" };
    }
    return null;
  })();

  const isLast = stepIndex >= steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dim layer — much darker so highlighted element pops */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-auto"
        onClick={() => stop(false)}
        style={
          rect && !isCenter
            ? {
                // Cut a transparent hole over the highlighted element
                clipPath: `polygon(
                  0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                  ${rect.left - padding}px ${rect.top - padding}px,
                  ${rect.left - padding}px ${rect.top + rect.height + padding}px,
                  ${rect.left + rect.width + padding}px ${rect.top + rect.height + padding}px,
                  ${rect.left + rect.width + padding}px ${rect.top - padding}px,
                  ${rect.left - padding}px ${rect.top - padding}px
                )`,
              }
            : undefined
        }
      />

      {/* Highlight ring around the target */}
      {rect && !isCenter && (
        <div
          className="absolute rounded-xl ring-4 ring-primary ring-offset-2 ring-offset-background animate-pulse pointer-events-none"
          style={highlightStyle}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute pointer-events-auto rounded-xl border border-border bg-card text-card-foreground shadow-2xl animate-fade-in"
        style={tooltipStyle}
      >
        {arrowStyle && <div style={arrowStyle} />}

        <div className="flex items-start justify-between gap-3 p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Step {stepIndex + 1} of {steps.length}
              </div>
              <div className="text-sm font-semibold leading-tight">{current.title}</div>
            </div>
          </div>
          <button
            onClick={() => stop(true)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
          {current.body}
        </div>

        {/* progress bar */}
        <div className="px-4">
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 p-3">
          <Button variant="ghost" size="sm" onClick={() => stop(true)}>
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={stepIndex === 0}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button size="sm" onClick={next} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              {isLast ? "Finish" : (<>Next <ArrowRight className="h-3.5 w-3.5 ml-1" /></>)}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
