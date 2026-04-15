import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardData, getTrustScoreHistory } from "@/actions/dashboard.actions";
import { getDictionary, getLocale } from "@/lib/dictionary";
import ProfileCard from "@/components/dashboard/ProfileCard";
import TrustChart from "@/components/dashboard/TrustChart";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

export default async function DashboardPage( ) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getLocale();
  const [user, trustHistory, dict] = await Promise.all([
    getDashboardData(),
    getTrustScoreHistory(),
    getDictionary(locale),
  ]);

  if (!user) redirect("/login");

  const t = dict.dashboard;
  const firstName = user.name?.trim().match(/\S+/)?.[0] ?? t.user;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <span className="font-interface text-xs font-bold tracking-sm uppercase text-primary">
            {t.title}
          </span>
          <h1 className="font-display text-4xl font-light text-foreground leading-none mt-2">
            {t.hello}, {firstName}
          </h1>
        </div>

        {/* Profile + Chart */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <ProfileCard
            name={user.name ?? t.user}
            image={user.image}
            trustScore={user.trustScore}
            createdAt={user.createdAt}
            dict={dict}
          />
          <div className="md:col-span-2">
            <TrustChart data={trustHistory || []} dict={dict} />
          </div>
        </div>

        {/* Tabs */}
        <DashboardTabs
          listings={user.items}
          claims={user.claims}
          currentUserId={session.user.id!}
          currentUserName={user.name ?? t.user}
          currentUserImage={user.image}
          dict={dict}
        />
      </div>
    </div>
  );
}
