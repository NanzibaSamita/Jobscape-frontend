"use client"

import { useEffect, useState } from "react"

export function Animated404() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Background circles */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="hsl(var(--primary))"
          opacity="0.1"
          className={`transition-all duration-1000 ${isVisible ? "scale-100 opacity-10" : "scale-0 opacity-0"}`}
          style={{ transformOrigin: "100px 100px" }}
        />
        <circle
          cx="300"
          cy="100"
          r="60"
          fill="hsl(var(--primary))"
          opacity="0.1"
          className={`transition-all duration-1000 delay-200 ${
            isVisible ? "scale-100 opacity-10" : "scale-0 opacity-0"
          }`}
          style={{ transformOrigin: "300px 100px" }}
        />

        {/* 4 */}
        <g
          className={`transition-all duration-800 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
        >
          <path
            d="M 60 60 L 60 140 M 60 100 L 140 100 M 140 60 L 140 140"
            stroke="hsl(var(--foreground))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-pulse"
          />
        </g>

        {/* 0 with magnifying glass */}
        <g
          className={`transition-all duration-800 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <circle cx="200" cy="100" r="40" stroke="hsl(var(--foreground))" strokeWidth="8" fill="none" />

          {/* Magnifying glass */}
          <circle
            cx="220"
            cy="80"
            r="15"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            className="animate-bounce"
          />
          <line
            x1="232"
            y1="92"
            x2="245"
            y2="105"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-bounce"
          />
        </g>

        {/* 4 */}
        <g
          className={`transition-all duration-800 delay-500 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          <path
            d="M 260 60 L 260 140 M 260 100 L 340 100 M 340 60 L 340 140"
            stroke="hsl(var(--foreground))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-pulse"
          />
        </g>

        {/* Floating particles */}
        <g className="animate-float">
          <circle cx="50" cy="40" r="2" fill="hsl(var(--primary))" opacity="0.6">
            <animate attributeName="cy" values="40;30;40" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="350" cy="160" r="2" fill="hsl(var(--primary))" opacity="0.6">
            <animate attributeName="cy" values="160;150;160" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="380" cy="50" r="1.5" fill="hsl(var(--muted-foreground))" opacity="0.4">
            <animate attributeName="cy" values="50;40;50" dur="4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Search beam effect */}
        <defs>
          <linearGradient id="searchBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="180" y="75" width="80" height="50" fill="url(#searchBeam)" className="animate-pulse" opacity="0.5" />
      </svg>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
