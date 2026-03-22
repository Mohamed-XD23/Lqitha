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
    <div className="bg-[#13131F] border border-[#C4A35A]/18 rounded-[4px] p-8 flex flex-col items-center text-center shadow-xl">
      <ProfileAvatar name={name} image={image} />

      <h2 className="font-cormorant text-2xl font-light text-[#F2EFE8] mt-4">
        {name}
      </h2>
      <p className="font-outfit text-[10px] text-[#7A7A8C] font-medium tracking-[2px] uppercase mt-2">
        Member Since {formatDateOnly(createdAt)}
      </p>

      <div className="mt-8 w-full bg-[#0F0F1A] border border-[#C4A35A]/12 rounded-[2px] p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#C4A35A]/20 group-hover:bg-[#C4A35A]/40 transition-all" />
        <p className="font-outfit text-[9px] font-semibold tracking-[3px] uppercase text-[#7A7A8C] mb-1">
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
