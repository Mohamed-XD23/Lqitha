import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";

export default async function NotFound() {
  const dict = await getDictionary();
  const t = dict.notFound;

  return (
    <div className="bg-obsidian min-h-screen text-ivory font-interface selection:bg-gold/30 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full text-center relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-4 mb-10">
            <div className="h-px w-10 bg-gold/30"></div>
            <span className="text-xs font-semibold tracking-[5px] uppercase text-gold">{t.badge}</span>
            <div className="h-px w-10 bg-gold/30"></div>
          </div>

          <h1 className="font-fraunces text-[120px] md:text-[180px] font-light leading-none tracking-tight text-ivory/90 mb-4 select-none">
            {t.title}
          </h1>

          <p className="font-interface text-xs font-medium tracking-[6px] uppercase text-slate mb-12">
            {t.subtitle}
          </p>

          <div className="bg-void/50 border border-gold/10 backdrop-blur-sm p-8 rounded-sm mb-12">
            <p className="text-slate text-sm leading-relaxed max-w-sm mx-auto">{t.description}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/" className="bg-gold hover:bg-ivory text-obsidian px-10 py-4 text-xs font-bold tracking-[3px] uppercase transition-all duration-300 rounded-xs min-w-[200px]">
              {t.returnHome}
            </Link>
            <Link href="/browse" className="border border-gold/20 hover:border-gold text-ivory px-10 py-4 text-xs font-bold tracking-[3px] uppercase transition-all duration-300 rounded-xs min-w-[200px]">
              {t.browseItems}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
