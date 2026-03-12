"use client";

import { useState, useTransition } from "react";
import ImageUploader from "@/components/ui/ImageUploader";
import { updateProfileImage } from "@/actions/dashboard.actions";

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
      setCurrentImage(url);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="mb-4 w-full">
        <ImageUploader value={currentImage ?? ""} onChange={handleChange} />
        <button
          onClick={() => setEditing(false)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative mb-4 group cursor-pointer"
      onClick={() => setEditing(true)}
    >
      {currentImage ? (
        <img
          src={currentImage}
          alt={name}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-100"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-xs">تغيير</span>
      </div>
    </div>
  );
}
