import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getItemById, getItemWithClaims } from "@/actions/item.actions";
import { formatDate } from "@/lib/utils/date";
import ClaimButton from "@/components/items/ClaimButton";
import ClaimsSection from "@/components/items/ClaimsSection";
import Link from "next/link";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  PHONE: "هاتف",
  KEYS: "مفاتيح",
  WALLET: "محفظة",
  DOCUMENTS: "وثائق",
  ELECTRONICS: "إلكترونيات",
  OTHER: "أخرى",
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const [item, session] = await Promise.all([getItemById(id), auth()]);
  if (!item) return notFound();

  const isOwner = session?.user?.id === item.user.id;
  const isLoggedIn = !!session?.user;
  const itemWithClaims = isOwner ? await getItemWithClaims(id) : null;

  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-3">
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: "40px",
              background:
                item.type === "LOST"
                  ? "rgba(200,100,100,0.08)"
                  : "rgba(100,200,130,0.08)",
              color: item.type === "LOST" ? "#D48080" : "#7DC99A",
              border:
                item.type === "LOST"
                  ? "1px solid rgba(200,100,100,0.2)"
                  : "1px solid rgba(100,200,130,0.2)",
            }}
          >
            {item.type === "LOST" ? "مفقود" : "موجود"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "11px",
              color: "#7A7A8C",
              letterSpacing: "1px",
            }}
          >
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Image */}
          <div
            className="aspect-square overflow-hidden rounded-sm"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(196,163,90,0.15)",
            }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">
                {item.type === "LOST" ? (
                  <i className="fa-solid fa-magnifying-glass" />
                ) : (
                  <i className="fa-solid fa-box" />
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <h1
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "42px",
                fontWeight: 300,
                color: "#F2EFE8",
                lineHeight: 1.1,
              }}
            >
              {item.title}
            </h1>

            <p
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "14px",
                fontWeight: 300,
                color: "#B0B0C0",
                lineHeight: 1.7,
              }}
            >
              {item.description}
            </p>

            {/* Info Grid */}
            <div
              style={{
                border: "1px solid rgba(196,163,90,0.15)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              {[
                { label: "الفئة", value: CATEGORY_LABELS[item.category] },
                {
                  label: "الموقع",
                  value: (
                    <>
                      <i className="fa-solid fa-location-dot mr-1" /> {item.location}
                    </>
                  ),
                },
                { label: "التاريخ", value: formatDate(item.date) },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3"
                  style={{
                    borderBottom:
                      i < 2 ? "1px solid rgba(196,163,90,0.1)" : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "11px",
                      letterSpacing: "1px",
                      color: "#7A7A8C",
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "13px",
                      color: "#F2EFE8",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Publisher */}
            <div
              className="flex items-center gap-4 px-5 py-4"
              style={{
                border: "1px solid rgba(196,163,90,0.15)",
                borderRadius: "2px",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                style={{
                  background: "rgba(196,163,90,0.1)",
                  color: "#C4A35A",
                  border: "1px solid rgba(196,163,90,0.3)",
                }}
              >
                {item.user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#F2EFE8",
                  }}
                >
                  {item.user.name}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "11px",
                    color: "#7A7A8C",
                    marginTop: "2px",
                  }}
                >
                  <i className="fa-solid fa-star mr-1" /> Trust Score:{" "}
                  {item.user.trustScore}
                </p>
              </div>
            </div>

            {/* Action */}
            {isOwner ? (
              <Link
                href="/dashboard"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "var(--font-outfit)",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  padding: "14px 32px",
                  borderRadius: "2px",
                  border: "1px solid rgba(196,163,90,0.3)",
                  color: "#C4A35A",
                }}
              >
                إدارة هذا البلاغ ← Dashboard
              </Link>
            ) : item.status === "RESOLVED" ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "14px",
                  fontFamily: "var(--font-outfit)",
                  fontSize: "12px",
                  letterSpacing: "2px",
                  color: "#7DC99A",
                  border: "1px solid rgba(100,200,130,0.2)",
                  borderRadius: "2px",
                  background: "rgba(100,200,130,0.05)",
                }}
              >
                ✓ تم إيجاد صاحب هذا البلاغ
              </div>
            ) : (
              <ClaimButton
                itemId={item.id}
                itemType={item.type}
                isLoggedIn={isLoggedIn}
                secretQuestion={item.secretQuestion ?? null}
              />
            )}
          </div>
        </div>

        {/* Claims Section */}
        {isOwner && itemWithClaims && session?.user && (
          <ClaimsSection
            claims={itemWithClaims.claims}
            itemId={id}
            ownerId={item.user.id}
            currentUserId={session.user.id!}
            currentUserName={session.user.name ?? "مستخدم"}
            currentUserImage={session.user.image}
          />
        )}
      </div>
    </div>
  );
}
