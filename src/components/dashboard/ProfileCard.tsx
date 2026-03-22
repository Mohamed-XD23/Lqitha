import { formatDateOnly } from "@/lib/utils/date";
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
    <div className="bg-void border border-gold/18 rounded-sm p-8 flex flex-col items-center text-center shadow-xl">
      <ProfileAvatar name={name} image={image} />

      <h2 className="font-cormorant text-2xl font-light text-ivory mt-4">
        {name}
      </h2>
      <p className="font-outfit text-[10px] text-slate font-medium tracking-xs uppercase mt-2">
        Member Since {formatDateOnly(createdAt)}
      </p>

      <div className="mt-8 w-full bg-[#0F0F1A] border border-gold/12 rounded-xs p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold/20 group-hover:bg-gold/40 transition-all" />
        <p className="font-outfit text-[9px] font-semibold tracking-[3px] uppercase text-slate mb-1">
          Trust Score
        </p>
        <p
          className="font-cormorant text-5xl font-light leading-none mt-2"
          style={{ color: scoreColor }}
        >
          {trustScore}
        </p>
      </div>
    </div>
  );
}
