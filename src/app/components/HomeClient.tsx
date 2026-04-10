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
    <div className="bg-background min-h-screen text-foreground font-interface selection:bg-primary/30">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <header className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary opacity-60"></div>
              <span className="text-[9px] font-semibold tracking-sm uppercase text-primary rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
                {home.hero.badge}
              </span>
            </div>

            <h1 className="font-display text-[clamp(64px,12vw,120px)] font-light leading-[0.9] tracking-[-0.03em] mb-8">
              {home.hero.titlePrefix}
              <em className="text-primary italic rtl:not-italic">{home.hero.titleSuffix}</em>
            </h1>

            <p className="text-[11px] font-light tracking-sm uppercase text-muted-foreground">
              {home.hero.tagline}
            </p>
          </header>

          <div className="max-w-xl mx-auto mb-12">
            <p className="text-muted-foreground text-sm leading-relaxed border-l border-primary/20 pl-6 mb-10 text-left md:text-center md:border-l-0 md:pl-0">
              {home.hero.description}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/browse"
                className="bg-primary hover:bg-primary-light text-background px-10 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
              >
                {home.hero.getStarted}
              </Link>
              <button
                onClick={() => scrollToSection(problemSectionRef)}
                className="border border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary px-10 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
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
        className="py-24 px-6 border-t border-border bg-card/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-interface italic text-primary text-sm">{home.problem.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.problem.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-primary/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-4xl text-primary/40">
                <HelpCircle className="w-9 h-9" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl text-foreground">
                {home.problem.lost.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                {home.problem.lost.desc}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-4xl text-primary/40">
                <Lock className="w-9 h-9" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl text-foreground">
                {home.problem.noVerification.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                {home.problem.noVerification.desc}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-4xl text-primary/40">
                <UserX className="w-9 h-9" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl text-foreground">
                {home.problem.noConnection.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                {home.problem.noConnection.desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOLUTION SECTION ===== */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-interface italic text-primary text-sm">{home.solution.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.solution.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-primary/10"></div>
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
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-foreground mb-2">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground text-sm font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent rounded-xl blur-2xl"></div>
              <div className="relative bg-card border border-primary/20 rounded-xl p-8 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-5xl text-primary mb-2 flex justify-center">
                    <ShieldCheck className="w-12 h-12" strokeWidth={1.5} />
                  </div>
                  <p className="text-muted-foreground text-xs tracking-widest uppercase">
                    {home.solution.secureInfo.title}
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  {home.solution.secureInfo.items.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-primary">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="py-24 px-6 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-20">
            <span className="font-interface italic text-primary text-sm">{home.howItWorks.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.howItWorks.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-primary/10"></div>
          </div>

          {/* Desktop Timeline View */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute top-24 left-0 right-0 h-1 bg-linear-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full"></div>
              <div className="grid grid-cols-3 gap-8 relative z-10">
                {[
                  {
                    num: "1",
                    title: home.howItWorks.steps[0].title,
                    desc: home.howItWorks.steps[0].desc,
                    icon: <PenTool className="w-8 h-8" strokeWidth={1.5} />,
                    color: "from-primary to-primary/60",
                  },
                  {
                    num: "2",
                    title: home.howItWorks.steps[1].title,
                    desc: home.howItWorks.steps[1].desc,
                    icon: <CheckCircle className="w-8 h-8" strokeWidth={1.5} />,
                    color: "from-primary/60 to-primary/20",
                  },
                  {
                    num: "3",
                    title: home.howItWorks.steps[2].title,
                    desc: home.howItWorks.steps[2].desc,
                    icon: <Handshake className="w-8 h-8" strokeWidth={1.5} />,
                    color: "from-primary/40 to-primary/10",
                  },
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center">
                    <div className="relative mb-8">
                      <div className={`absolute inset-0 bg-linear-to-br ${step.color} rounded-full blur-xl opacity-30`}></div>
                      <div className="relative w-20 h-20 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center group hover:border-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 cursor-pointer">
                        <div className="text-3xl text-primary flex items-center justify-center w-full h-full">
                          {step.icon}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center w-full bg-background border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
                      <div className="flex items-center gap-2 font-display text-xl text-foreground mb-3 text-center group-hover:text-primary transition-colors">
                        <p className="font-interface text-primary text-xl font-light">
                          {step.num} .{" "}
                          <span className="text-foreground">{step.title}</span>
                        </p>
                      </div>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed text-center">
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
                  <div className="absolute left-6 top-16 w-px h-20 bg-linear-to-b from-primary/40 to-transparent"></div>
                )}
                <div className="flex gap-6">
                  <div className="shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full border border-primary/20 bg-background flex items-center justify-center">
                      <div className="text-xl text-primary">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-background border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
                    <div className="font-interface text-primary text-lg mb-2">
                      {step.num} .{" "}
                      <span className="text-foreground">{step.title}</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-light leading-relaxed">
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
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-interface italic text-primary text-sm">{home.features.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.features.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-primary/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {home.features.items.map((feature, idx: number) => (
              <div
                key={idx}
                className="group p-8 bg-card border border-primary/5 hover:border-primary/20 transition-all duration-500 relative"
              >
                <div className="absolute top-0 left-0 w-0.75 h-0 group-hover:h-full bg-linear-to-b from-primary to-transparent transition-all duration-500"></div>
                <div className="font-interface italic text-primary text-sm mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-display text-2xl mb-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST SCORE SECTION ===== */}
      <section className="py-24 px-6 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-interface italic text-primary text-sm">{home.trustSystem.sectionNum}</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.trustSystem.sectionTitle}
            </h2>
            <div className="flex-1 h-px bg-primary/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-2xl text-foreground mb-3">
                  {home.trustSystem.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">
                  {home.trustSystem.description}
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: home.trustSystem.points.claim, val: home.trustSystem.points.claim_desc },
                  { label: home.trustSystem.points.resolved, val: home.trustSystem.points.resolved_desc },
                  { label: home.trustSystem.points.perks, val: home.trustSystem.points.perks_desc }
                ].map((item, idx) => (
                  <div key={idx} className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-xs font-medium tracking-wider">
                        {item.val}
                      </span>
                      <span className="text-primary text-sm font-semibold">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-card border-2 border-primary/20 rounded-xl p-8">
                <div className="text-center mb-8">
                  <p className="font-interface text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground rtl:text-[11px] rtl:tracking-[0.8px] rtl:normal-case">
                    {home.trustSystem.levels.title}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-green-500/20">
                    <div className="text-2xl text-green-400">
                      <Star className="w-6 h-6" fill="currentColor" strokeWidth={1} />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{home.trustSystem.levels.verified}</p>
                      <p className="text-muted-foreground text-xs">Score 70+</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-primary/30">
                    <div className="text-2xl text-primary">
                      <StarHalf className="w-6 h-6" fill="currentColor" strokeWidth={1} />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{home.trustSystem.levels.trusted}</p>
                      <p className="text-muted-foreground text-xs">Score 40-69</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-red-500/20">
                    <div className="text-2xl text-red-400">
                      <Star className="w-6 h-6" fill="currentColor" strokeWidth={1} />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{home.trustSystem.levels.new}</p>
                      <p className="text-muted-foreground text-xs">Score Below 40</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION SECTION ===== */}
      <section className="py-24 px-6 border-t border-border bg-linear-to-b from-card/50 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="text-[9px] font-semibold tracking-sm uppercase text-primary rtl:text-[12px] rtl:tracking-[1px] rtl:normal-case rtl:font-medium">
              {home.cta.badge}
            </span>
          </div>

          <h2 className="font-display text-[clamp(48px,8vw,72px)] font-light leading-tight mb-6 text-foreground">
            {home.cta.title}
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-2xl mx-auto font-light">
            {home.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="bg-primary hover:bg-primary-light text-background px-12 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs shadow-lg shadow-primary/20"
            >
              {home.cta.browse}
            </Link>
            <Link
              href="/register"
              className="border-2 border-primary hover:bg-primary/10 text-primary px-12 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
            >
              {home.cta.register}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
