import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

type Props = { className?: string; alt?: string };

/**
 * Advora Labs monogram. Renders the dark logo on light backgrounds
 * and the light logo on dark backgrounds.
 */
export function Logo({ className = "h-9 w-9", alt = "Advora Labs" }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const src = mounted && resolvedTheme === "dark" ? logoLight : logoDark;
  return <img src={src} alt={alt} className={`object-contain ${className}`} />;
}
