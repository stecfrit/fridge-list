import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RainbowTextProps {
  text: string;
  className?: string;
}

export function RainbowText({ text, className }: RainbowTextProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={cn("inline-block font-bold", className)}
      style={{
        background: `linear-gradient(
          90deg,
          #ff0000,
          #ff7f00,
          #ffff00,
          #00ff00,
          #0000ff,
          #8f00ff,
          #ff00bf,
          #ff0000
        )`,
        backgroundSize: "200% 100%",
        backgroundPosition: `${offset}% 0`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animation: "rainbow-flow 2s linear infinite",
      }}
    >
      {text}
    </span>
  );
}
