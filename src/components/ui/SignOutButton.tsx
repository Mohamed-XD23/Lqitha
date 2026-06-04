"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { handleSignOut } from "@/actions/auth.actions";

interface SignOutButtonProps {
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  label: string;
  showIcon?: boolean;
}

export default function SignOutButton({
  className = "",
  iconClassName = "w-4 h-4",
  labelClassName = "",
  label,
  showIcon = true,
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await handleSignOut();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`${className} active:scale-95 transition-all duration-200 ${
        isPending ? "opacity-70 cursor-wait" : ""
      }`}
    >
      {showIcon && (
        isPending ? (
          <Loader2 className={`${iconClassName} animate-spin`} />
        ) : (
          <LogOut className={iconClassName} strokeWidth={2} />
        )
      )}
      <span className={labelClassName}>{label}</span>
    </button>
  );
}
