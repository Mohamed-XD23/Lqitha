"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-[#080810] min-h-screen text-[#F2EFE8] font-outfit selection:bg-[#C4A35A]/30 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full text-center relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#C4A35A]/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-4 mb-10">
            <div className="h-px w-10 bg-[#C4A35A]/30"></div>
            <span className="text-[10px] font-semibold tracking-[5px] uppercase text-[#C4A35A]">
              Discovery Error
            </span>
            <div className="h-px w-10 bg-[#C4A35A]/30"></div>
          </div>

          <h1 className="font-cormorant text-[120px] md:text-[180px] font-light leading-none tracking-tight text-[#F2EFE8]/90 mb-4 select-none">
            404
          </h1>

          <p className="font-outfit text-xs font-medium tracking-[6px] uppercase text-[#7A7A8C] mb-12">
            This Item Appears to Be Lost
          </p>

          <div className="bg-[#13131F]/50 border border-[#C4A35A]/10 backdrop-blur-sm p-8 rounded-[4px] mb-12">
            <p className="text-[#7A7A8C] text-sm leading-relaxed max-w-sm mx-auto">
              The page you&apos;re looking for doesn&apos;t exist. Just like a lost item,
              sometimes things go missing. We&apos;ll help you find your way back.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/"
              className="bg-[#C4A35A] hover:bg-[#F2EFE8] text-[#080810] px-10 py-4 text-[10px] font-bold tracking-[3px] uppercase transition-all duration-300 rounded-[2px] min-w-[200px]"
            >
              Return Home
            </Link>
            <Link
              href="/browse"
              className="border border-[#C4A35A]/20 hover:border-[#C4A35A] text-[#F2EFE8] px-10 py-4 text-[10px] font-bold tracking-[3px] uppercase transition-all duration-300 rounded-[2px] min-w-[200px]"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
