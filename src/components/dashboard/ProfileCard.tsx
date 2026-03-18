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
    <div className="bg-void border-2 border-gold/18 rounded-xl p-8 flex flex-col items-center text-center">
      <ProfileAvatar name={name} image={image} />

      <h2 className="font-cormorant text-2xl font-normal text-ivory mt-2">
        {name}
      </h2>
      <p className="font-outfit text-[10px] text-slate tracking-wider mt-1.5">
        member since {formatDateOnly(createdAt)}
      </p>

      <div className="mt-6 w-full bg-obsidian border border-gold/15 rounded-lg p-5">
        <p className="font-outfit text-[10px] font-medium tracking-[3px] uppercase text-slate">
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
