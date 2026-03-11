import { formatDate } from "@/lib/utils/date";

interface Props {
  name: string;
  image: string | null;
  trustScore: number;
  createdAt: Date;
}

export default function ProfileCard({ name, image, trustScore, createdAt }: Props) {
  // نحدد لون الـ Score حسب القيمة
  const scoreColor =
    trustScore >= 70 ? "text-green-600" :
    trustScore >= 40 ? "text-amber-500" :
    "text-red-500";

  return (
    <div className="flex flex-col items-center rounded-2xl border bg-white p-8 shadow-sm text-center">
      {/* صورة المستخدم أو الحرف الأول */}
      {image ? (
        <img
          src={image}
          alt={name}
          className="mb-4 h-20 w-20 rounded-full object-cover ring-2 ring-gray-100"
        />
      ) : (
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-900">{name}</h2>
      <p className="mt-1 text-sm text-gray-400">
        Member since {formatDate(createdAt)}
      </p>

      <div className="mt-6 w-full rounded-xl border bg-gray-50 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Trust Score
        </p>
        <p className={`mt-1 text-4xl font-bold ${scoreColor}`}>
          {trustScore}
        </p>
      </div>
    </div>
  );
}