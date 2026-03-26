import { getDictionary } from "@/lib/dictionary";

export default async function TermsPage() {
  const dict = await getDictionary();

  return (
    <div className="bg-obsidian min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-14">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg width="24" height="34" viewBox="0 0 261.42 370" fill="none">
              <path d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z" fill="#C4A35A"/>
              <path d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z" fill="#7A7A8C"/>
            </svg>
            <span className="font-fraunces text-3xl font-light tracking-sm text-ivory">LQITHA</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold/40"></div>
            <span className="font-interface text-xs font-semibold tracking-sm uppercase text-gold">
              {dict.terms.badge}
            </span>
          </div>
          <h1 className="font-display text-5xl font-light text-ivory leading-tight mt-2">
            {dict.terms.title}
          </h1>
          <p className="font-interface text-xs text-slate mt-3 tracking-px">
            {dict.terms.lastUpdated}
          </p>
        </div>

        {dict.terms.sections.map((section: { title: string; content: string }, i: number) => (
          <div
            key={i}
            className="mb-8 pb-8 border-b border-gold/10"
          >
            <h2 className="font-display text-[22px] font-normal text-gold mb-3">
              {section.title}
            </h2>
            <p className="font-interface text-sm text-[#B0B0C0] leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
