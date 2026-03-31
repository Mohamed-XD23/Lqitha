"use client";

import { useRef, useState } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import ImageUploadLoader from "./ImageUploadLoader";
import Image from "next/image";
import { Dictionary } from "@/lib/dictionary.types";

interface Props {
  dict: Dictionary;
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ dict, value, onChange }: Props) {
  const t = dict.imgUpload;
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      if (data.secure_url) onChange(data.secure_url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
      //IMPORTANT: Reset file input so selecting the same file again triggers onChange
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2">
      {value && typeof value === "string" && value.length > 0 ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <Image
            src={value}
            alt="Preview"
            fill
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 text-white rounded-full p-1"
          >
            <Trash2 className="w-5 h-5 text-red-500/80" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !loading && inputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
            loading
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer hover:border-primary"
          }`}
        >
          {loading ? (
            <>
              <ImageUploadLoader />
              <p className="text-sm text-muted-foreground">{t.uploading}</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t.upload}
              </p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}