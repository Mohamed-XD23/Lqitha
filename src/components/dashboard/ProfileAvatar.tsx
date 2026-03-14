"use client";

import { useState, useTransition } from "react";
import ImageUploader from "@/components/ui/ImageUploader";
import { updateProfileImage } from "@/actions/dashboard.actions";
import { toast } from "sonner";

interface Props {
  name: string;
  image: string | null;
}

export default function ProfileAvatar({ name, image }: Props) {
  const [currentImage, setCurrentImage] = useState(image);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(url: string) {
    startTransition(async () => {
      await updateProfileImage(url);
      toast.success("تم تحديث الصورة ✓");
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
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "11px",
            color: "#7A7A8C",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          إلغاء
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
        <img
          src={currentImage}
          alt={name}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(196,163,90,0.3)",
          }}
        />
      ) : (
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(196,163,90,0.1)",
            border: "2px solid rgba(196,163,90,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "28px",
            fontWeight: 400,
            color: "#C4A35A",
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <i
          className="fa-solid fa-camera"
          style={{ color: "#C4A35A", fontSize: "16px" }}
        />
      </div>
    </div>
  );
}
