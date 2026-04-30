import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTour } from "@/components/tour/TourContext";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

type Rect = { top: number; left: number; width: number; height: number };

export function TourOverlay() {
  const { active, current, stepIndex, steps, next, prev, stop, restart } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
        if (attempts < 30) raf = window.requestAnimationFrame(measure);
        else setRect(null);
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

  if (!mounted) return null;

  // Floating "Start guided tour" pill (bottom-right) when tour isn't active
  if (!active || !current) {
    return createPortal(
      <button
        onClick={restart}
        className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur px-4 py-2.5 text-sm font-medium text-foreground shadow-2xl hover:bg-card transition-all hover:scale-105 group animate-fade-in"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        Start guided tour
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
      </button>,
      document.body,
    );
  }

  const isCenter = !current.selector || current.placement === "center" || !rect;
  const padding = 6;
  const highlightStyle: React.CSSProperties | undefined = rect
    ? {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }
    : undefined;

  // Compact tooltip
  const tooltipWidth = 340;
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
    const margin = 18;
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
  const isLast = stepIndex >= steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dim layer with cutout for highlighted element */}
      <div
        className="absolute inset-0 bg-black/75 pointer-events-auto"
        onClick={() => stop(false)}
        style={
          rect && !isCenter
            ? {
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

      {/* Glowing highlight ring */}
      {rect && !isCenter && (
        <div
          className="absolute rounded-lg pointer-events-none transition-all duration-300"
          style={{
            ...highlightStyle,
            boxShadow:
              "0 0 0 2px hsl(var(--primary)), 0 0 0 6px hsl(var(--primary) / 0.25), 0 0 40px 8px hsl(var(--primary) / 0.45)",
          }}
        />
      )}

      {/* Compact tooltip card */}
      <div
        className="absolute pointer-events-auto rounded-xl border border-border bg-card text-card-foreground shadow-2xl animate-fade-in"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Step {stepIndex + 1} of {steps.length}
              </div>
              <div className="text-base font-semibold leading-tight">{current.title}</div>
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

        {/* Dotted progress (matches reference) */}
        <div className="px-4 pb-3 flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <Button variant="ghost" size="sm" onClick={() => stop(true)} className="text-muted-foreground">
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={stepIndex === 0}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
            <Button size="sm" onClick={next} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLast ? "Finish" : (<>Next <ArrowRight className="h-3.5 w-3.5 ml-1" /></>)}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
