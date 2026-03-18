"use client";

import React, { useRef } from "react";
import Link from "next/link";

export default function Home() {
  const nextSectionRef = useRef<HTMLDivElement>(null);

  const scrollToNext = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-obsidian min-h-screen text-ivory font-outfit selection:bg-gold/30">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Subtle background noise/grid effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <header className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-8 bg-gold opacity-60"></div>
              <span className="text-[9px] font-semibold tracking-[4px] uppercase text-gold">
                Brand Guidelines
              </span>
            </div>
            
            <h1 className="font-cormorant text-[clamp(64px,12vw,120px)] font-light leading-[0.9] tracking-[-0.03em] mb-4">
              Lqi<em className="text-gold italic">tha</em>
            </h1>
            
            <p className="text-[11px] font-light tracking-[4px] uppercase text-slate">
              Lost &middot; Found &middot; Verified
            </p>
          </header>

          <div className="max-w-xl mx-auto mb-12">
            <p className="text-slate text-sm leading-relaxed border-l border-gold/20 pl-6 mb-10 text-left md:text-center md:border-l-0 md:pl-0">
              A secure digital platform for lost & found item management with ownership verification. 
              Built for young adults who demand clarity, trust, and precision in every interaction.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={scrollToNext}
                className="bg-gold hover:bg-gold-light text-obsidian px-10 py-4 text-[11px] font-medium tracking-[2px] uppercase transition-all duration-300 rounded-[2px]"
              >
                Get Started
              </button>
              <Link 
                href="/items" 
                className="border border-gold/20 hover:border-gold/40 hover:bg-gold/5 text-gold px-10 py-4 text-[11px] font-medium tracking-[2px] uppercase transition-all duration-300 rounded-[2px]"
              >
                Browse Items
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={nextSectionRef}
        id="features"
        className="py-24 px-6 border-t border-gold/10 bg-void/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-cormorant italic text-gold text-sm">01</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase">Core Features</h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                num: "01",
                title: "Report Lost Items",
                desc: "Quickly report any misplaced valuable with precise details and location data."
              },
              {
                num: "02",
                title: "Verify Ownership",
                desc: "Our secure verification system ensures items are only returned to their rightful owners."
              },
              {
                num: "03",
                title: "Claim Discovery",
                desc: "Seamlessly browse found items and initiate secure claim requests within seconds."
              }
            ].map((feature) => (
              <div key={feature.num} className="group p-8 bg-void border border-gold/5 hover:border-gold/20 transition-all duration-500 relative">
                <div className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full bg-linear-to-b from-gold to-transparent transition-all duration-500"></div>
                <div className="font-cormorant italic text-gold text-xs mb-4">{feature.num}</div>
                <h3 className="font-cormorant text-2xl mb-4 text-ivory">{feature.title}</h3>
                <p className="text-slate text-sm leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}