"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Lock,
  UserX,
  Check,
  ShieldCheck,
  Star,
  StarHalf,
  PenTool,
  CheckCircle,
  Handshake,
} from "lucide-react";
import type { Dictionary } from "@/lib/dictionary.types";

interface Props {
  dict: Dictionary;
}

export default function Home({ dict }: Props) {
  const problemSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { home } = dict;

  return (
    <div className="bg-obsidian min-h-screen text-ivory font-interface selection:bg-gold/30">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <header className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-8 bg-gold opacity-60"></div>
              <span className="text-[9px] font-semibold tracking-sm uppercase text-gold rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
                {home.hero.badge}
              </span>
            </div>

            <h1 className="font-display text-[clamp(64px,12vw,120px)] font-light leading-[0.9] tracking-[-0.03em] mb-8">
              {home.hero.titlePrefix}
              <em className="text-gold italic rtl:not-italic">{home.hero.titleSuffix}</em>
            </h1>

            <p className="text-[11px] font-light tracking-sm uppercase text-slate">
              {home.hero.tagline}
            </p>
          </header>

          <div className="max-w-xl mx-auto mb-12">
            <p className="text-slate text-sm leading-relaxed border-l border-gold/20 pl-6 mb-10 text-left md:text-center md:border-l-0 md:pl-0">
              {home.hero.description}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/browse"
                className="bg-gold hover:bg-gold-light text-obsidian px-10 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
              >
                {home.hero.getStarted}
              </Link>
              <button
                onClick={() => scrollToSection(problemSectionRef)}
                className="border border-gold/20 hover:border-gold/40 hover:bg-gold/5 text-gold px-10 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
              >
                {home.hero.learnMore}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section
        ref={problemSectionRef}
        className="py-24 px-6 border-t border-gold/10 bg-void/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-interface italic text-gold text-sm">{home.problem.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.problem.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-4xl text-gold/40">
                <HelpCircle className="w-9 h-9" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl text-ivory">
                {home.problem.lost.title}
              </h3>
              <p className="text-slate text-sm leading-relaxed font-light">
                {home.problem.lost.desc}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-4xl text-gold/40">
                <Lock className="w-9 h-9" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl text-ivory">
                {home.problem.noVerification.title}
              </h3>
              <p className="text-slate text-sm leading-relaxed font-light">
                {home.problem.noVerification.desc}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-4xl text-gold/40">
                <UserX className="w-9 h-9" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl text-ivory">
                {home.problem.noConnection.title}
              </h3>
              <p className="text-slate text-sm leading-relaxed font-light">
                {home.problem.noConnection.desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOLUTION SECTION ===== */}
      <section className="py-24 px-6 border-t border-gold/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-interface italic text-gold text-sm">{home.solution.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.solution.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { 
                  title: home.solution.centralized.title, 
                  desc: home.solution.centralized.desc 
                },
                { 
                  title: home.solution.verification.title, 
                  desc: home.solution.verification.desc 
                },
                { 
                  title: home.solution.trust.title, 
                  desc: home.solution.trust.desc 
                },
                { 
                  title: home.solution.communication.title, 
                  desc: home.solution.communication.desc 
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gold/20 text-gold">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-ivory mb-2">
                      {item.title}
                    </h4>
                    <p className="text-slate text-sm font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-gold/10 to-transparent rounded-xl blur-2xl"></div>
              <div className="relative bg-void border border-gold/20 rounded-xl p-8 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-5xl text-gold mb-2 flex justify-center">
                    <ShieldCheck className="w-12 h-12" strokeWidth={1.5} />
                  </div>
                  <p className="text-slate text-xs tracking-widest uppercase">
                    {home.solution.secureInfo.title}
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  {home.solution.secureInfo.items.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-gold">✓</span>
                      <span className="text-slate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="py-24 px-6 border-t border-gold/10 bg-void/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-20">
            <span className="font-interface italic text-gold text-sm">{home.howItWorks.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.howItWorks.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          {/* Desktop Timeline View */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute top-24 left-0 right-0 h-1 bg-linear-to-r from-gold/20 via-gold/40 to-gold/20 rounded-full"></div>
              <div className="grid grid-cols-3 gap-8 relative z-10">
                {[
                  {
                    num: "1",
                    title: home.howItWorks.steps[0].title,
                    desc: home.howItWorks.steps[0].desc,
                    icon: <PenTool className="w-8 h-8" strokeWidth={1.5} />,
                    color: "from-gold to-gold/60",
                  },
                  {
                    num: "2",
                    title: home.howItWorks.steps[1].title,
                    desc: home.howItWorks.steps[1].desc,
                    icon: <CheckCircle className="w-8 h-8" strokeWidth={1.5} />,
                    color: "from-gold/60 to-gold/20",
                  },
                  {
                    num: "3",
                    title: home.howItWorks.steps[2].title,
                    desc: home.howItWorks.steps[2].desc,
                    icon: <Handshake className="w-8 h-8" strokeWidth={1.5} />,
                    color: "from-gold/40 to-gold/10",
                  },
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center">
                    <div className="relative mb-8">
                      <div className={`absolute inset-0 bg-linear-to-br ${step.color} rounded-full blur-xl opacity-30`}></div>
                      <div className="relative w-20 h-20 rounded-full bg-obsidian border-2 border-gold/40 flex items-center justify-center group hover:border-gold hover:shadow-lg hover:shadow-gold/30 transition-all duration-300 cursor-pointer">
                        <div className="text-3xl text-gold flex items-center justify-center w-full h-full">
                          {step.icon}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center w-full bg-obsidian border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-all duration-300 group">
                      <div className="flex items-center gap-2 font-display text-xl text-ivory mb-3 text-center group-hover:text-gold transition-colors">
                        <p className="font-interface text-gold text-xl font-light">
                          {step.num} .{" "}
                          <span className="text-ivory">{step.title}</span>
                        </p>
                      </div>
                      <p className="text-slate text-sm font-light leading-relaxed text-center">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Vertical Timeline View */}
          <div className="md:hidden space-y-8">
            {[
              {
                num: "1",
                title: home.howItWorks.steps[0].title,
                desc: home.howItWorks.steps[0].desc,
                icon: <PenTool className="w-8 h-8" strokeWidth={1.5} />,
              },
              {
                num: "2",
                title: home.howItWorks.steps[1].title,
                desc: home.howItWorks.steps[1].desc,
                icon: <CheckCircle className="w-8 h-8" strokeWidth={1.5} />,
              },
              {
                num: "3",
                title: home.howItWorks.steps[2].title,
                desc: home.howItWorks.steps[2].desc,
                icon: <Handshake className="w-8 h-8" strokeWidth={1.5} />,
              },
            ].map((step, idx, arr) => (
              <div key={step.num} className="relative">
                {idx !== arr.length - 1 && (
                  <div className="absolute left-6 top-16 w-px h-20 bg-linear-to-b from-gold/40 to-transparent"></div>
                )}
                <div className="flex gap-6">
                  <div className="shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full border border-gold/20 bg-obsidian flex items-center justify-center">
                      <div className="text-xl text-gold">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-obsidian border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-all">
                    <div className="font-interface text-gold text-lg mb-2">
                      {step.num} .{" "}
                      <span className="text-ivory">{step.title}</span>
                    </div>
                    <p className="text-slate text-sm font-light leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 px-6 border-t border-gold/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-interface italic text-gold text-sm">{home.features.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.features.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {home.features.items.map((feature, idx: number) => (
              <div
                key={idx}
                className="group p-8 bg-void border border-gold/5 hover:border-gold/20 transition-all duration-500 relative"
              >
                <div className="absolute top-0 left-0 w-0.75 h-0 group-hover:h-full bg-linear-to-b from-gold to-transparent transition-all duration-500"></div>
                <div className="font-interface italic text-gold text-sm mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-display text-2xl mb-4 text-ivory">
                  {feature.title}
                </h3>
                <p className="text-slate text-sm leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST SCORE SECTION ===== */}
      <section className="py-24 px-6 border-t border-gold/10 bg-void/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-interface italic text-gold text-sm">{home.trustSystem.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.trustSystem.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-2xl text-ivory mb-3">
                  {home.trustSystem.title}
                </h3>
                <p className="text-slate text-sm leading-relaxed font-light">
                  {home.trustSystem.description}
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: home.trustSystem.points.claim, val: home.trustSystem.points.claim_desc },
                  { label: home.trustSystem.points.resolved, val: home.trustSystem.points.resolved_desc },
                  { label: home.trustSystem.points.perks, val: home.trustSystem.points.perks_desc }
                ].map((item, idx) => (
                  <div key={idx} className="bg-obsidian border border-gold/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate text-xs font-medium tracking-wider">
                        {item.val}
                      </span>
                      <span className="text-gold text-sm font-semibold">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-void border-2 border-gold/20 rounded-xl p-8">
                <div className="text-center mb-8">
                  <p className="font-interface text-[9px] font-medium tracking-[3px] uppercase text-slate rtl:text-[11px] rtl:tracking-[0.8px] rtl:normal-case">
                    {home.trustSystem.levels.title}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-obsidian rounded-lg border border-green-500/20">
                    <div className="text-2xl text-green-400">
                      <Star className="w-6 h-6" fill="currentColor" strokeWidth={1} />
                    </div>
                    <div>
                      <p className="text-ivory text-sm font-medium">{home.trustSystem.levels.verified}</p>
                      <p className="text-slate text-xs">Score 70+</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-obsidian rounded-lg border border-gold/30">
                    <div className="text-2xl text-gold">
                      <StarHalf className="w-6 h-6" fill="currentColor" strokeWidth={1} />
                    </div>
                    <div>
                      <p className="text-ivory text-sm font-medium">{home.trustSystem.levels.trusted}</p>
                      <p className="text-slate text-xs">Score 40-69</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-obsidian rounded-lg border border-red-500/20">
                    <div className="text-2xl text-red-400">
                      <Star className="w-6 h-6" fill="currentColor" strokeWidth={1} />
                    </div>
                    <div>
                      <p className="text-ivory text-sm font-medium">{home.trustSystem.levels.new}</p>
                      <p className="text-slate text-xs">Score Below 40</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION SECTION ===== */}
      <section className="py-24 px-6 border-t border-gold/10 bg-linear-to-b from-void/50 to-obsidian">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="text-[9px] font-semibold tracking-sm uppercase text-gold rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.cta.badge}
            </span>
          </div>

          <h2 className="font-display text-[clamp(48px,8vw,72px)] font-light leading-tight mb-6 text-ivory">
            {home.cta.title}
          </h2>

          <p className="text-slate text-lg leading-relaxed mb-12 max-w-2xl mx-auto font-light">
            {home.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="bg-gold hover:bg-gold-light text-obsidian px-12 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs shadow-lg shadow-gold/20"
            >
              {home.cta.browse}
            </Link>
            <Link
              href="/register"
              className="border-2 border-gold hover:bg-gold/10 text-gold px-12 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
            >
              {home.cta.register}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
