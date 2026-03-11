import { redirect } from "next/navigation";
import {auth} from "@/lib/auth";
import { getDashboardData, getTrustScoreHistory } from "@/actions/dashboard.actions";
import ProfileCard from "@/components/dashboard/ProfileCard";
import TrustChart from "@/components/dashboard/TrustChart";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const [user, trustHistory] = await Promise.all([
        getDashboardData(),
        getTrustScoreHistory(),
    ]);

    if (!user) redirect("login");
    
    return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">

        {/* ── Profile + Chart ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <ProfileCard
            name={user.name ?? "مستخدم"}
            image={user.image}
            trustScore={user.trustScore}
            createdAt={user.createdAt}
          />
          <div className="md:col-span-2">
            <TrustChart data={trustHistory} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <DashboardTabs
          listings={user.items}
          claims={user.claims}
        />

      </div>
    </main>
  );
}