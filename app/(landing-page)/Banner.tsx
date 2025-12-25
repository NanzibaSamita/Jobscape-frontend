"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Linkedin, Instagram, Facebook, ChevronUp } from "lucide-react";

export default function Banner() {
  const router = useRouter();

  return (
    <header className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* background (dark -> purple) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 650px at 85% 0%, rgba(168,85,247,0.55), transparent 60%)," +
            "radial-gradient(900px 550px at 0% 0%, rgba(99,102,241,0.20), transparent 55%)," +
            "linear-gradient(135deg, #000000 0%, #0a0614 45%, #2c1b4c 100%)",
        }}
      />
      {/* subtle bottom fade like the mock */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-black" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* top bar */}
        <nav className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Jscape"
              width={110}
              height={28}
              priority
              className="h-7 w-auto"
            />
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-10 text-sm text-white/70">
            <Link href="#about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link
              href="#contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Top Right Section: Socials + Get Started Button */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex items-center gap-4 text-white/80">
              <Link
                href="#"
                aria-label="LinkedIn"
                className="hover:text-white transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="Facebook"
                className="hover:text-white transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Link>
            </div>

            {/* Added Get Started Button */}
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full px-5 py-2 text-xs font-bold text-white 
                         border border-white/20 bg-white/5 hover:bg-white/10 
                         hover:border-white/40 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* hero */}
        <section className="flex flex-col items-center text-center pt-12 md:pt-20">
          <ChevronUp className="h-5 w-5 text-white/60 mb-8" />

          <h1 className="text-white tracking-wide text-5xl md:text-6xl lg:text-7xl">
            <span className="font-medium">
              AI-DRIVEN{" "}
              <span className="bg-gradient-to-r from-[#B56BFF] to-[#E879F9] bg-clip-text text-transparent">
                HIRING
              </span>
            </span>
            <span className="block mt-3 font-light">Simplified</span>
          </h1>

          <p className="mt-8 max-w-2xl text-sm md:text-base text-white/60 leading-relaxed">
            Discover Top Talent And Job Opportunities In Seconds
            <br className="hidden sm:block" />
            With Our AI-Powered Platform. Fast, Efficient, And
            <br className="hidden sm:block" />
            Tailored To Your Needs.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={() => router.push("/hire")}
              className="rounded-full px-10 py-4 text-sm font-semibold text-black
                         bg-gradient-to-r from-[#8B5CF6] to-[#C084FC]
                         shadow-[0_10px_30px_rgba(140,82,255,0.25)]
                         hover:brightness-110 active:brightness-95 transition"
            >
              Hire Top Talents
            </button>

            <button
              onClick={() => router.push("/jobs")}
              className="rounded-full px-10 py-4 text-sm font-semibold text-black
                         bg-gradient-to-r from-[#8B5CF6] to-[#C084FC]
                         shadow-[0_10px_30px_rgba(140,82,255,0.25)]
                         hover:brightness-110 active:brightness-95 transition"
            >
              Explore Jobs
            </button>
          </div>
        </section>
      </div>
    </header>
  );
}
