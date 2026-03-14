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
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#C4A35A",
            }}
          >
            لوحة التحكم
          </span>
          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "40px",
              fontWeight: 300,
              color: "#F2EFE8",
              lineHeight: 1,
              marginTop: "8px",
            }}
          >
            مرحباً، {user.name?.split(" ")[0]}
          </h1>
        </div>

        {/* Profile + Chart */}
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

        {/* Tabs */}
        <DashboardTabs
          listings={user.items}
          claims={user.claims}
          currentUserId={session.user.id!}
          currentUserName={session.user.name ?? "مستخدم"}
          currentUserImage={session.user.image}
        />
      </div>
    </div>
  );
}
