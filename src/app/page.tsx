"use client";

import React, { useRef } from "react";
import Link from "next/link";

export default function Home() {
  const problemSectionRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-obsidian min-h-screen text-ivory font-outfit selection:bg-gold/30">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Subtle background noise/grid effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <header className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-8 bg-gold opacity-60"></div>
              <span className="text-[9px] font-semibold tracking-sm uppercase text-gold">
                Lost · Found · Verified
              </span>
            </div>

            <h1 className="font-cormorant text-[clamp(64px,12vw,120px)] font-light leading-[0.9] tracking-[-0.03em] mb-4">
              Lqi<em className="text-gold italic">tha</em>
            </h1>

            <p className="text-[11px] font-light tracking-sm uppercase text-slate">
              Your Lost Items Deserve to Come Home
            </p>
          </header>

          <div className="max-w-xl mx-auto mb-12">
            <p className="text-slate text-sm leading-relaxed border-l border-gold/20 pl-6 mb-10 text-left md:text-center md:border-l-0 md:pl-0">
              A secure digital platform for lost & found item management with
              ownership verification. Built for young adults who demand clarity,
              trust, and precision in every interaction.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/browse"
                className="bg-gold hover:bg-gold-light text-obsidian px-10 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
              >
                Get Started
              </Link>
              <button
                onClick={() => scrollToSection(problemSectionRef)}
                className="border border-gold/20 hover:border-gold/40 hover:bg-gold/5 text-gold px-10 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
              >
                Learn More
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
            <span className="font-outfit italic text-gold text-sm">01</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase">
              The Problem
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="flex flex-col items-center jus md:flex-row gap-8">
            <div className="space-y-4">
              <div className="text-4xl text-gold/40">
                <i className="fa-solid fa-circle-question"></i>
              </div>
              <h3 className="font-cormorant text-2xl text-ivory">
                Lost & Confused
              </h3>
              <p className="text-slate text-sm leading-relaxed font-light">
                Losing valuable items is stressful. You don't know where to look
                or who to trust with your belongings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-4xl text-gold/40">
                <i className="fa-solid fa-lock"></i>
              </div>
              <h3 className="font-cormorant text-2xl text-ivory">
                No Verification
              </h3>
              <p className="text-slate text-sm leading-relaxed font-light">
                How do you know the person claiming your item is really the
                owner? Traditional methods lack security.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-4xl text-gold/40">
                <i className="fa-solid fa-users-slash"></i>
              </div>
              <h3 className="font-cormorant text-2xl text-ivory">
                No Connection
              </h3>
              <p className="text-slate text-sm leading-relaxed font-light">
                Lost and found items scattered across social media and bulletin
                boards. No centralized, trustworthy place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOLUTION SECTION ===== */}
      <section className="py-24 px-6 border-t border-gold/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-outfit italic text-gold text-sm">02</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase">
              Our Solution
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gold/20 text-gold">
                    <i className="fa-solid fa-check text-sm"></i>
                  </div>
                </div>
                <div>
                  <h4 className="font-cormorant text-xl text-ivory mb-2">
                    Centralized Platform
                  </h4>
                  <p className="text-slate text-sm font-light">
                    One secure place for all lost and found items in your
                    community.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gold/20 text-gold">
                    <i className="fa-solid fa-check text-sm"></i>
                  </div>
                </div>
                <div>
                  <h4 className="font-cormorant text-xl text-ivory mb-2">
                    Verified Ownership
                  </h4>
                  <p className="text-slate text-sm font-light">
                    Secret questions ensure only the real owner can claim items.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gold/20 text-gold">
                    <i className="fa-solid fa-check text-sm"></i>
                  </div>
                </div>
                <div>
                  <h4 className="font-cormorant text-xl text-ivory mb-2">
                    Trust Score System
                  </h4>
                  <p className="text-slate text-sm font-light">
                    Build your reputation through successful claims and verified
                    transactions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gold/20 text-gold">
                    <i className="fa-solid fa-check text-sm"></i>
                  </div>
                </div>
                <div>
                  <h4 className="font-cormorant text-xl text-ivory mb-2">
                    Secure Communication
                  </h4>
                  <p className="text-slate text-sm font-light">
                    Direct messaging between owners and claimants for
                    coordination.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-gold/10 to-transparent rounded-xl blur-2xl"></div>
              <div className="relative bg-void border border-gold/20 rounded-xl p-8 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-5xl text-gold mb-2">
                    <i className="fa-solid fa-shield-check"></i>
                  </div>
                  <p className="text-slate text-xs tracking-widest uppercase">
                    Secure & Verified
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-gold">✓</span>
                    <span className="text-slate">Encrypted communications</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold">✓</span>
                    <span className="text-slate">
                      Secure verification process
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold">✓</span>
                    <span className="text-slate">Privacy-first design</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold">✓</span>
                    <span className="text-slate">
                      Transparent trust metrics
                    </span>
                  </div>
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
            <span className="font-outfit italic text-gold text-sm">03</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase">
              How It Works
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          {/* Desktop Timeline View */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Background gradient line */}
              <div className="absolute top-24 left-0 right-0 h-1 bg-linear-to-r from-gold/20 via-gold/40 to-gold/20 rounded-full"></div>
              <div className="grid grid-cols-3 gap-8 relative z-10">
                {[
                  {
                    num: "1",
                    title: "Report",
                    desc: "Post your lost or found item with details, photos, and a secret question.",
                    icon: "fa-pen-to-square",
                    color: "from-gold to-gold/60",
                  },
                  {
                    num: "2",
                    title: "Verify",
                    desc: "Claimants answer your secret question. Only the real owner will know the answer.",
                    icon: "fa-check-circle",
                    color: "from-gold/60 to-gold/20",
                  },
                  {
                    num: "3",
                    title: "Reunite",
                    desc: "Accept the verified claim and coordinate item return. Build your trust score.",
                    icon: "fa-handshake",
                    color: "from-gold/40 to-gold/10",
                  },
                ].map((step, idx) => (
                  <div key={step.num} className="flex flex-col items-center">
                    {/* Step circle with gradient background */}
                    <div className="relative mb-8">
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${step.color} rounded-full blur-xl opacity-30`}
                      ></div>
                      <div className="relative w-20 h-20 rounded-full bg-obsidian border-2 border-gold/40 flex items-center justify-center group hover:border-gold hover:shadow-lg hover:shadow-gold/30 transition-all duration-300 cursor-pointer">
                        <div className="text-3xl text-gold">
                          <i className={`fa-solid ${step.icon}`}></i>
                        </div>
                      </div>
                    </div>

                    {/* Content card */}
                    <div className="flex flex-col items-center w-full bg-obsidian border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-all duration-300 group">
                      <div className="flex items-center gap-2 font-cormorant text-xl text-ivory mb-3 text-center group-hover:text-gold transition-colors">
                        <p className="font-outfit text-gold text-xl font-light">
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
                title: "Report",
                desc: "Post your lost or found item with details, photos, and a secret question.",
                icon: "fa-pen-to-square",
              },
              {
                num: "2",
                title: "Verify",
                desc: "Claimants answer your secret question. Only the real owner will know the answer.",
                icon: "fa-check-circle",
              },
              {
                num: "3",
                title: "Reunite",
                desc: "Accept the verified claim and coordinate item return. Build your trust score.",
                icon: "fa-handshake",
              },
            ].map((step, idx, arr) => (
              <div key={step.num} className="relative">
                {/* Vertical connector line */}
                {idx !== arr.length - 1 && (
                  <div className="absolute left-10 top-20 w-1 h-12 bg-linear-to-b from-gold/40 to-gold/10"></div>
                )}

                <div className="flex gap-6">
                  {/* Circle */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-obsidian border-2 border-gold/40 flex items-center justify-center hover:border-gold hover:shadow-lg hover:shadow-gold/30 transition-all">
                      <div className="text-center text-2xl text-gold mb-1">
                        <i className={`fa-solid ${step.icon}`}></i>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2 bg-obsidian border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-all">
                    <div className="font-outfit text-gold text-lg">
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
      <section
        ref={featuresSectionRef}
        className="py-24 px-6 border-t border-gold/10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className="font-outfit italic text-gold text-sm">04</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase">
              Core Features
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                num: "01",
                title: "Report Lost Items",
                desc: "Quickly report any misplaced valuable with precise details, location data, and photos. Set a secret question only you know the answer to.",
              },
              {
                num: "02",
                title: "Verify Ownership",
                desc: "Our secure verification system ensures items are only returned to their rightful owners. Secret questions prevent fraudulent claims.",
              },
              {
                num: "03",
                title: "Claim Discovery",
                desc: "Seamlessly browse found items and initiate secure claim requests within seconds. Answer verification questions to prove ownership.",
              },
            ].map((feature) => (
              <div
                key={feature.num}
                className="group p-8 bg-void border border-gold/5 hover:border-gold/20 transition-all duration-500 relative"
              >
                <div className="absolute top-0 left-0 w-[3px] h-0 group-hover:h-full bg-linear-to-b from-gold to-transparent transition-all duration-500"></div>
                <div className="font-outfit italic text-gold text-sm mb-4">
                  {feature.num}
                </div>
                <h3 className="font-cormorant text-2xl mb-4 text-ivory">
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
            <span className="font-outfit italic text-gold text-sm">05</span>
            <h2 className="text-[9px] font-semibold tracking-[5px] uppercase">
              Trust Score System
            </h2>
            <div className="flex-1 h-px bg-gold/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="font-cormorant text-2xl text-ivory mb-3">
                  Build Your Reputation
                </h3>
                <p className="text-slate text-sm leading-relaxed font-light">
                  Your trust score reflects your reliability and integrity on
                  Lqitha. It grows with every successful claim and verified
                  transaction.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-obsidian border border-gold/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate text-xs font-medium tracking-wider">
                      Successful Claim
                    </span>
                    <span className="text-gold text-sm font-semibold">
                      +10 points
                    </span>
                  </div>
                  <p className="text-slate text-xs font-light">
                    When your claim is accepted by the owner
                  </p>
                </div>

                <div className="bg-obsidian border border-gold/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate text-xs font-medium tracking-wider">
                      Item Resolved
                    </span>
                    <span className="text-gold text-sm font-semibold">
                      +15 points
                    </span>
                  </div>
                  <p className="text-slate text-xs font-light">
                    When you return a found item to its owner
                  </p>
                </div>

                <div className="bg-obsidian border border-gold/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate text-xs font-medium tracking-wider">
                      High Score Perks
                    </span>
                    <span className="text-gold text-sm font-semibold">
                      Exclusive
                    </span>
                  </div>
                  <p className="text-slate text-xs font-light">
                    Unlock badges, priority visibility, and community
                    recognition
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-void border-2 border-gold/20 rounded-xl p-8">
                <div className="text-center mb-8">
                  <p className="font-outfit text-[9px] font-medium tracking-[3px] uppercase text-slate mb-4">
                    Trust Score Levels
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-obsidian rounded-lg border border-green-500/20">
                    <div className="text-2xl text-green-400">
                      <i className="fa-solid fa-star"></i>
                    </div>
                    <div>
                      <p className="text-ivory text-sm font-medium">Verified</p>
                      <p className="text-slate text-xs">Score 70+</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-obsidian rounded-lg border border-gold/30">
                    <div className="text-2xl text-gold">
                      <i className="fa-solid fa-star-half-stroke"></i>
                    </div>
                    <div>
                      <p className="text-ivory text-sm font-medium">Trusted</p>
                      <p className="text-slate text-xs">Score 40-69</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-obsidian rounded-lg border border-red-500/20">
                    <div className="text-2xl text-red-400">
                      <i className="fa-solid fa-star"></i>
                    </div>
                    <div>
                      <p className="text-ivory text-sm font-medium">
                        New Member
                      </p>
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
            <span className="text-[9px] font-semibold tracking-sm uppercase text-gold">
              Ready to Get Started?
            </span>
          </div>

          <h2 className="font-cormorant text-[clamp(48px,8vw,72px)] font-light leading-tight mb-6 text-ivory">
            Find Your Lost Items Today
          </h2>

          <p className="text-slate text-lg leading-relaxed mb-12 max-w-2xl mx-auto font-light">
            Join thousands of users who have successfully recovered their
            belongings through Lqitha. Whether you're looking for something you
            lost or want to help others find theirs, we're here to help.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="bg-gold hover:bg-gold-light text-obsidian px-12 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs shadow-lg shadow-gold/20"
            >
              Browse Items Now
            </Link>
            <Link
              href="/register"
              className="border-2 border-gold hover:bg-gold/10 text-gold px-12 py-4 text-[11px] font-medium tracking-xs uppercase transition-all duration-300 rounded-xs"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
