import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTour } from "@/components/tour/TourContext";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Sparkles, Compass } from "lucide-react";

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

  // Floating launcher when tour is closed
  if (!active || !current) {
    return createPortal(
      <button
        onClick={restart}
        className="group fixed bottom-6 right-6 z-[90] flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-primary to-primary-glow px-4 py-3 text-sm font-semibold text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-0.5 animate-fade-in"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-white/20">
          <Compass className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-primary animate-pulse" />
        </span>
        Take a tour
      </button>,
      document.body,
    );
  }

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

  // Card layout: side-docked panel (right edge) for highlight steps, centered for intro/outro
  const cardWidth = 380;
  const dockMargin = 24;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 720;

  // Decide dock side: opposite of highlighted element to avoid covering it
  const dockSide: "left" | "right" | "center" = (() => {
    if (isCenter || !rect) return "center";
    const targetCenterX = rect.left + rect.width / 2;
    return targetCenterX < vw / 2 ? "right" : "left";
  })();

  const cardStyle: React.CSSProperties = (() => {
    if (dockSide === "center") {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: cardWidth };
    }
    const top = Math.max(24, Math.min(vh / 2 - 180, vh - 380));
    if (dockSide === "right") {
      return { top, right: dockMargin, width: cardWidth };
    }
    return { top, left: dockMargin, width: cardWidth };
  })();

  // Connector line from card to highlighted element
  const connector: { x1: number; y1: number; x2: number; y2: number } | null = (() => {
    if (isCenter || !rect) return null;
    const cardTop = Math.max(24, Math.min(vh / 2 - 180, vh - 380));
    const cardCenterY = cardTop + 180;
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;
    if (dockSide === "right") {
      const cardLeftEdge = vw - dockMargin - cardWidth;
      return { x1: cardLeftEdge, y1: cardCenterY, x2: rect.left + rect.width + padding, y2: targetCenterY };
    } else {
      const cardRightEdge = dockMargin + cardWidth;
      return { x1: cardRightEdge, y1: cardCenterY, x2: rect.left - padding, y2: targetCenterY };
    }
  })();

  const isLast = stepIndex >= steps.length - 1;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dim layer with cutout for highlighted element */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-[1px] pointer-events-auto animate-fade-in"
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

      {/* Highlight ring (no glow) */}
      {rect && !isCenter && (
        <div
          className="absolute rounded-xl pointer-events-none transition-all duration-300 border-2 border-primary"
          style={highlightStyle}
        />
      )}

      {/* SVG connector line from card to target */}
      {connector && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="tour-connector" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d={`M ${connector.x1} ${connector.y1} Q ${(connector.x1 + connector.x2) / 2} ${connector.y1}, ${connector.x2} ${connector.y2}`}
            stroke="url(#tour-connector)"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
            className="animate-fade-in"
          />
          <circle cx={connector.x2} cy={connector.y2} r="5" fill="hsl(var(--primary))" className="animate-pulse" />
        </svg>
      )}

      {/* Side-docked card with numbered badge + gradient header */}
      <div
        key={current.id}
        className="absolute pointer-events-auto rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden animate-scale-in"
        style={cardStyle}
      >
        {/* Gradient header strip */}
        <div className="relative h-1.5 w-full bg-muted overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header row: numbered circle badge + close */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/30">
                <span className="text-sm font-bold">{stepIndex + 1}</span>
                <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-primary-glow drop-shadow" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  Guided tour · {stepIndex + 1} / {steps.length}
                </div>
                <div className="text-base font-semibold leading-tight mt-0.5">{current.title}</div>
              </div>
            </div>
            <button
              onClick={() => stop(true)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{current.body}</p>

          {/* Step pips */}
          <div className="mt-5 flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? "w-6 bg-primary"
                    : i < stepIndex
                    ? "w-1.5 bg-primary/60"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Footer actions */}
          <div className="mt-5 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => stop(true)} className="text-muted-foreground hover:text-foreground">
              Skip
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prev} disabled={stepIndex === 0}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={next}
                className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 shadow-md shadow-primary/30"
              >
                {isLast ? "Finish tour" : (<>Next <ArrowRight className="h-3.5 w-3.5 ml-1" /></>)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
