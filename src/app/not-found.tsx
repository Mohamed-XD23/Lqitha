"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-obsidian min-h-screen text-ivory font-outfit selection:bg-gold/30">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Subtle background noise/grid effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-8 bg-gold opacity-60"></div>
              <span className="text-[9px] font-semibold tracking-[4px] uppercase text-gold">
                Page Not Found
              </span>
            </div>

            <h1 className="font-cormorant text-[clamp(80px,14vw,140px)] font-light leading-[0.9] tracking-[-0.03em] text-gold mb-4">
              404
            </h1>

            <p className="text-[11px] font-light tracking-[4px] uppercase text-slate">
              This Item Appears to Be Lost
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <p className="text-slate text-sm leading-relaxed border-l border-gold/20 pl-6 mb-12 text-left md:text-center md:border-l-0 md:pl-0">
              The page you're looking for doesn't exist. Just like a lost item,
              sometimes things go missing. Let's help you find your way back.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="bg-gold hover:bg-gold-light text-obsidian px-10 py-4 text-[11px] font-medium tracking-[2px] uppercase transition-all duration-300 rounded-[2px]"
              >
                Return Home
              </Link>
              <Link
                href="/browse"
                className="border border-gold/20 hover:border-gold/40 hover:bg-gold/5 text-gold px-10 py-4 text-[11px] font-medium tracking-[2px] uppercase transition-all duration-300 rounded-[2px]"
              >
                Browse Items
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
