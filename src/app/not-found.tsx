import { getDictionary, getLocale } from "@/lib/dictionary";
import Link from "next/link";

export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.notFound;

  return (
    <div className="bg-background min-h-screen text-foreground font-interface selection:bg-primary/30 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full text-center relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-4 mb-10">
            <div className="h-px w-10 bg-primary/30"></div>
            <span className="text-xs font-semibold tracking-[5px] uppercase text-primary">{t.badge}</span>
            <div className="h-px w-10 bg-primary/30"></div>
          </div>

          <h1 className="font-fraunces text-[120px] md:text-[180px] font-light leading-none tracking-tight text-foreground/90 mb-4 select-none">
            {t.title}
          </h1>

          <p className="font-interface text-xs font-medium tracking-[6px] uppercase text-muted-foreground mb-12">
            {t.subtitle}
          </p>

          <div className="bg-card/50 border border-border backdrop-blur-sm p-8 rounded-sm mb-12">
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">{t.description}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/" className="bg-primary hover:bg-foreground text-background px-10 py-4 text-xs font-bold tracking-[3px] uppercase transition-all duration-300 rounded-xs min-w-[200px]">
              {t.returnHome}
            </Link>
            <Link href="/browse" className="border border-primary/20 hover:border-primary text-foreground px-10 py-4 text-xs font-bold tracking-[3px] uppercase transition-all duration-300 rounded-xs min-w-[200px]">
              {t.browseItems}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
