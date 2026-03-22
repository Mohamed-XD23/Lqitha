import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getDashboardData,
  getTrustScoreHistory,
} from "@/actions/dashboard.actions";
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

  if (!user) redirect("/login");

  return (
    <div className="bg-[#080810] min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <span className="font-outfit text-[10px] font-bold tracking-[4px] uppercase text-[#C4A35A]">
            Dashboard
          </span>
          <h1 className="font-cormorant text-4xl font-light text-[#F2EFE8] leading-none mt-2">
            Hello {user.name?.split(" ")[0]}
          </h1>
        </div>

        {/* Profile + Chart */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <ProfileCard
            name={user.name ?? "User"}
            image={user.image}
            trustScore={user.trustScore}
            createdAt={user.createdAt}
          />
          <div className="md:col-span-2">
            <TrustChart data={trustHistory || []} />
          </div>
        </div>

        {/* Tabs */}
        <DashboardTabs
          listings={user.items}
          claims={user.claims}
          currentUserId={session.user.id!}
          currentUserName={session.user.name ?? "User"}
          currentUserImage={session.user.image}
        />
      </div>
    </div>
  );
}
