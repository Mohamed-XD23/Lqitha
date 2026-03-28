"use client";

import { useState, useTransition } from "react";
import ImageUploader from "@/components/ui/ImageUploader";
import { updateProfileImage } from "@/actions/dashboard.actions";
import { toast } from "sonner";
import Image from "next/image";
import { Check, X, Camera } from "lucide-react";
import { Dictionary } from "@/lib/dictionary.types";

interface Props {
  name: string;
  image: string | null;
  dict: Dictionary
}

export default function ProfileAvatar({ name, image, dict }: Props) {
  const t = dict.Profile;
  const [currentImage, setCurrentImage] = useState(image);
  const [editing, setEditing] = useState(false);
  const [,startTransition] = useTransition();

  function handleChange(url: string) {
    startTransition(async () => {
      await updateProfileImage(url);
      toast.success(
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Check className="w-4 h-4" strokeWidth={2.5} />
          <span>{t.Toast.photoupdate}</span>
        </div>,
      );
      setCurrentImage(url);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div style={{ width: "100%", marginBottom: "16px" }}>
        <ImageUploader value={currentImage ?? ""} onChange={handleChange} />
        <button
          onClick={() => setEditing(false)}
          className="font-interface text-md text-slate bg-slate/10 border border-slate/20 rounded-md px-3 py-1 mt-2"
        >
          <div className="flex items-center gap-2">
            <span>{t.cancel}</span>
            <X className="w-4 h-4 text-slate" strokeWidth={2} />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      style={{ position: "relative", cursor: "pointer", marginBottom: "8px" }}
      className="group"
    >
      {currentImage ? (
        <Image
          src={currentImage}
          alt={name}
          width={120}
          height={120}
          className="rounded-full object-cover border-2 border-gold/30"
        />
      ) : (
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(196,163,90,0.1)",
            border: "2px solid rgba(196,163,90,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display), serif",
            fontSize: "52px",
            fontWeight: 400,
            color: "var(--color-gold)",
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Camera className="w-4 h-4 text-ivory/80" strokeWidth={2} />
      </div>
    </div>
  );
}
