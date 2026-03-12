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
    trustScore >= 70
      ? "text-green-600"
      : trustScore >= 40
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="flex flex-col items-center rounded-2xl border bg-white p-8 shadow-sm text-center">
      <ProfileAvatar name={name} image={image} />

      <h2 className="text-xl font-bold text-gray-900">{name}</h2>
      <p className="mt-1 text-sm text-gray-400">
        Member since {formatDate(createdAt)}
      </p>

      <div className="mt-6 w-full rounded-xl border bg-gray-50 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Trust Score
        </p>
        <p className={`mt-1 text-4xl font-bold ${scoreColor}`}>{trustScore}</p>
      </div>
    </div>
  );
}
