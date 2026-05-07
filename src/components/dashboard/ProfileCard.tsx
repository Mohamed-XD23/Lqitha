import { formatDateOnly } from "@/lib/utils/date";
import ProfileAvatar from "./ProfileAvatar";
import type { Dictionary } from "@/lib/dictionary.types";
import TrustScoreStars from "@/components/ui/TrustScoreStars";

interface Props {
  name: string;
  image: string | null;
  trustScore: number;
  createdAt: Date;
  dict: Dictionary;
}

export default function ProfileCard({
  name,
  image,
  trustScore,
  createdAt,
  dict,
}: Props) {
  const t = dict.profileCard;

  return (
    <div className="bg-card border border-primary/18 rounded-sm p-8 flex flex-col items-center text-center shadow-xl">
      <ProfileAvatar name={name} image={image} dict={dict} />

      <h2 className="font-display text-2xl font-light text-foreground mt-4">
        {name}
      </h2>
      <p className="font-interface text-xs text-muted-foreground font-medium tracking-xs uppercase mt-2">
        {t.memberSince} {formatDateOnly(createdAt)}
      </p>

      <div className="mt-8 w-full bg-sidebar-accent border border-primary/12 rounded-xs p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-all" />
        <p className="font-interface text-xs font-semibold tracking-[3px] uppercase text-muted-foreground mb-1">
          {t.trustScore}
        </p>
        <TrustScoreStars
          score={trustScore}
          size="lg"
          className="mt-4 flex-col gap-3"
          intervalClassName="text-sm tracking-xs"
        />
      </div>
    </div>
  );
}
