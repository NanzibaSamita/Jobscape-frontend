"use client"

import { useEffect, useState } from "react"

export function AnimatedNetworkError() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <svg viewBox="0 0 300 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Device/Computer */}
        <g
          className={`transition-all duration-800 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
        >
          <rect
            x="20"
            y="80"
            width="60"
            height="40"
            rx="5"
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <rect x="25" y="85" width="50" height="30" rx="2" fill="hsl(var(--muted))" />
          <circle cx="50" cy="130" r="3" fill="hsl(var(--foreground))" />
        </g>

        {/* Signal waves that break */}
        <g className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          {/* Wave 1 */}
          <path
            d="M 90 100 Q 130 80 170 100"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <animate attributeName="strokeOpacity" values="0.8;0.2;0.8" dur="2s" repeatCount="3" />
            <animate
              attributeName="stroke"
              values="hsl(var(--primary));hsl(var(--destructive))"
              dur="6s"
              fill="freeze"
            />
          </path>

          {/* Wave 2 */}
          <path
            d="M 95 100 Q 130 90 165 100"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animate attributeName="strokeOpacity" values="0.6;0.1;0.6" dur="2s" begin="0.5s" repeatCount="3" />
            <animate
              attributeName="stroke"
              values="hsl(var(--primary));hsl(var(--destructive))"
              dur="6s"
              fill="freeze"
            />
          </path>

          {/* Wave 3 */}
          <path
            d="M 100 100 Q 130 95 160 100"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <animate attributeName="strokeOpacity" values="0.4;0.05;0.4" dur="2s" begin="1s" repeatCount="3" />
            <animate
              attributeName="stroke"
              values="hsl(var(--primary));hsl(var(--destructive))"
              dur="6s"
              fill="freeze"
            />
          </path>
        </g>

        {/* Server/Cloud */}
        <g
          className={`transition-all duration-800 delay-500 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          <ellipse
            cx="240"
            cy="90"
            rx="25"
            ry="15"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <ellipse
            cx="250"
            cy="100"
            rx="20"
            ry="12"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <ellipse
            cx="230"
            cy="105"
            rx="15"
            ry="10"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
        </g>

        {/* Disconnection X */}
        <g
          className={`transition-all duration-500 delay-1500 ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
        >
          <circle cx="150" cy="100" r="20" fill="hsl(var(--destructive))" opacity="0.1" />
          <line
            x1="135"
            y1="85"
            x2="165"
            y2="115"
            stroke="hsl(var(--destructive))"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="165"
            y1="85"
            x2="135"
            y2="115"
            stroke="hsl(var(--destructive))"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* Error indicators */}
        <g className="animate-pulse">
          <circle cx="50" cy="60" r="3" fill="hsl(var(--destructive))" opacity="0">
            <animate attributeName="opacity" values="0;0.8;0" dur="1s" begin="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="240" cy="60" r="3" fill="hsl(var(--destructive))" opacity="0">
            <animate attributeName="opacity" values="0;0.8;0" dur="1s" begin="6.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Status text simulation */}
        <g className={`transition-all duration-1000 delay-2000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <rect x="80" y="150" width="140" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <rect x="80" y="160" width="100" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <rect x="80" y="170" width="80" height="3" rx="1.5" fill="hsl(var(--destructive))" opacity="0.5" />
        </g>
      </svg>
    </div>
  )
}
