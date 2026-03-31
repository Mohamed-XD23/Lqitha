"use client";

import React, { useState } from "react";
import {
  updateProfile,
  changePassword,
  deleteAccount,
} from "@/actions/settings.actions";
import { User, Lock, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "@/components/ui/ImageUploader";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dictionary } from "@/lib/dictionary.types";

interface SettingsFormProps {
  dict: Dictionary;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function SettingsForm({dict , user } : SettingsFormProps) {
  const t = dict.settings;
  const router = useRouter();

  // Profile State
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Danger Zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    const result = await updateProfile({ name, image });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      router.refresh();
    }

    setIsUpdatingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsChangingPass(true);
    const result = await changePassword(currentPass, newPass);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    }
    setIsChangingPass(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Type DELETE to confirm account deletion.");
      return;
    }

    setIsDeleting(true);
    const result = await deleteAccount();
    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
    } else {
      toast.success("Account deleted. Redirecting...");
      router.push("/login?deleted=true");
    }
  };

  return (
    <div className="space-y-12">
      {/* Profile Section */}
      <section className="bg-void border border-gold/15 rounded-xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold/50 group-hover:bg-gold transition-colors" />

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-ivory">
              {t.profileInfo}
            </h2>
            <p className="text-slate text-xs font-interface mt-1">
              {t.profileSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
          <div className="space-y-4">
            <label className="block text-xs font-interface uppercase tracking-widest text-slate">
              {t.profilePicture}
            </label>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 shrink-0 rounded-full bg-obsidian border border-gold/20 overflow-hidden flex items-center justify-center">
                {image && typeof image === "string" ? (
                  <Image
                    src={image}
                    alt="Profile"
                    className="object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <User className="w-8 h-8 text-gold/30" />
                )}
              </div>
              <div className="flex-1">
                <ImageUploader
                  dict={dict}
                  value={image && typeof image === "string" ? image : undefined}
                  onChange={(url) => setImage(url || "")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-interface uppercase tracking-widest text-slate">
              {t.name}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-obsidian border border-gold/20 rounded-xs px-4 py-3 text-ivory font-interface text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all placeholder:text-slate/40"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-interface uppercase tracking-widest text-slate">
              {t.email}
            </label>
            <input
              type="text"
              disabled
              value={user.email}
              className="w-full bg-obsidian/50 border border-gold/10 rounded-xs px-4 py-3 text-slate font-interface text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate/50 font-interface">
              {t.emailmessage}
            </p>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-obsidian rounded-xs font-interface text-xs font-bold uppercase tracking-widest hover:bg-ivory transition-all disabled:opacity-50"
          >
            {isUpdatingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t.saveChanges}
          </button>
        </form>
      </section>

      {/* Security Section */}
      <section className="bg-void border border-gold/15 rounded-xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold/50 group-hover:bg-gold transition-colors" />

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-ivory">
              {t.updatePassword}
            </h2>
            <p className="text-slate text-xs font-interface mt-1">
              {t.updatePasswordSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="block text-xs font-interface uppercase tracking-widest text-slate">
              {t.currentPassword}
            </label>
            <input
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full bg-obsidian border border-gold/20 rounded-xs px-4 py-3 text-ivory font-interface text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all placeholder:text-slate/40"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-interface uppercase tracking-widest text-slate">
              {t.newPassword}
            </label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full bg-obsidian border border-gold/20 rounded-xs px-4 py-3 text-ivory font-interface text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all placeholder:text-slate/40"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-interface uppercase tracking-widest text-slate">
              {t.confirmNewPassword}
            </label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full bg-obsidian border border-gold/20 rounded-xs px-4 py-3 text-ivory font-interface text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all placeholder:text-slate/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-obsidian rounded-xs font-interface text-xs font-bold uppercase tracking-widest hover:bg-ivory transition-all disabled:opacity-50"
          >
            {isChangingPass ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t.savepasswordbtn}
          </button>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-void border border-red-500/20 rounded-xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50 group-hover:bg-red-500 transition-colors" />

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-red-400">
              {t.deleteAccount}
            </h2>
            <p className="text-slate text-xs font-interface mt-1">
              {t.deleteAccountSubtitle}
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <p className="text-sm text-slate font-interface leading-relaxed">
            <span>{t.paragraph1}</span>
            <span>{t.paragraph2}</span>
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-interface uppercase tracking-widest text-red-400/80">
              {t.deleteConfirmation}
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full bg-obsidian border border-red-500/20 rounded-xs px-4 py-3 text-ivory font-interface text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-red-500/20"
              placeholder="DELETE"
            />
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== "DELETE" || isDeleting}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xs font-interface text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {t.deleteAccountBtn}
          </button>
        </div>
      </section>
    </div>
  );
}
