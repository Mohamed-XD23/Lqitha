import { formatDate } from "@/lib/utils/date";
import ProfileAvatar from "./ProfileAvatar";

interface Props {
  name: string;
  image: string | null;
  trustScore: number;
  createdAt: Date;
}

export default function ProfileCard({
  name,
  image,
  trustScore,
  createdAt,
}: Props) {
  const scoreColor =
    trustScore >= 70 ? "#7DC99A" : trustScore >= 40 ? "#C4A35A" : "#D48080";

  return (
    <div
      style={{
        background: "#13131F",
        border: "1px solid rgba(196,163,90,0.18)",
        borderRadius: "4px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <ProfileAvatar name={name} image={image} />

      <h2
        style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "22px",
          fontWeight: 400,
          color: "#F2EFE8",
          marginTop: "8px",
        }}
      >
        {name}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: "11px",
          color: "#7A7A8C",
          letterSpacing: "1px",
          marginTop: "6px",
        }}
      >
        عضو منذ {formatDate(createdAt)}
      </p>

      <div
        style={{
          marginTop: "24px",
          width: "100%",
          background: "#0F0F1A",
          border: "1px solid rgba(196,163,90,0.15)",
          borderRadius: "2px",
          padding: "20px 16px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "9px",
            fontWeight: 500,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#7A7A8C",
          }}
        >
          Trust Score
        </p>
        <p
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "52px",
            fontWeight: 300,
            color: scoreColor,
            lineHeight: 1,
            marginTop: "8px",
          }}
        >
          {trustScore}
        </p>
      </div>
    </div>
  );
}
