import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import SettingsForm from "@/components/settings/SettingsForm";
import { getDictionary } from "@/lib/dictionary";

export default async function SettingsPage() {
  const dict = await getDictionary();
  const t = dict.settings;
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
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <span className="font-interface text-xs font-bold tracking-[3px] uppercase text-primary">
            {t.badge}
          </span>
          <h1 className="font-display text-4xl font-light text-foreground leading-none mt-2">
            {t.title}
          </h1>
        </div>

        <SettingsForm key={`${user.name}-${user.image}`} user={user}
        dict={dict}
        />
      </div>
    </div>
  );
}
