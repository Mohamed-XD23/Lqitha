import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="bg-obsidian min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <span className="font-interface text-xs font-bold tracking-[3px] uppercase text-gold">
            Account Preferences
          </span>
          <h1 className="font-display text-4xl font-light text-ivory leading-none mt-2">
            Settings
          </h1>
        </div>

        <SettingsForm key={`${user.name}-${user.image}`} user={user} />
      </div>
    </div>
  );
}
