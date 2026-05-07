"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TRUST_SCORE_STEPS = [
  { min: 80, stars: 5, interval: "80+" },
  { min: 60, stars: 4, interval: "60-79" },
  { min: 40, stars: 3, interval: "40-59" },
  { min: 20, stars: 2, interval: "20-39" },
  { min: 0, stars: 1, interval: "0-19" },
];

function getTrustScoreStep(score: number) {
  const normalizedScore = Math.max(0, score);
  const step = TRUST_SCORE_STEPS.find((item) => normalizedScore >= item.min);

  return {
    ...(step ?? TRUST_SCORE_STEPS[TRUST_SCORE_STEPS.length - 1]),
    stars: normalizedScore === 0 ? 0 : step?.stars ?? 0,
  };
}

function getTrustScoreColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-primary";
  return "text-red-400";
}

interface TrustScoreStarsProps {
  score: number;
  className?: string;
  starClassName?: string;
  intervalClassName?: string;
  showInterval?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function TrustScoreStars({
  score,
  className,
  starClassName,
  intervalClassName,
  showInterval = true,
  size = "md",
}: TrustScoreStarsProps) {
  const step = getTrustScoreStep(score);
  const colorClassName = getTrustScoreColor(score);
  const starSizeClassName =
    size === "lg" ? "h-7 w-7" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      aria-label={`Trust score ${score}, interval ${step.interval}, ${step.stars} out of 5 stars`}
      title={`Trust score: ${step.interval}`}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => {
          const isFilled = index < step.stars;

          return (
            <Star
              key={index}
              className={cn(
                starSizeClassName,
                isFilled ? colorClassName : "text-muted-foreground/30",
                starClassName,
              )}
              fill={isFilled ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {showInterval && (
        <span
          className={cn(
            "font-interface text-xs font-semibold text-muted-foreground",
            intervalClassName,
          )}
        >
          {step.interval}
        </span>
      )}
    </div>
  );
}
