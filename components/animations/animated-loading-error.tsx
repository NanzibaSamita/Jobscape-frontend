"use client"

import { useEffect, useState } from "react"

export function AnimatedLoadingError() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Loading circle that breaks */}
        <g className={`transition-all duration-800 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <circle cx="100" cy="100" r="60" fill="none" stroke="hsl(var(--border))" strokeWidth="4" opacity="0.3" />

          {/* Loading arc that fails */}
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="120 240"
            className="animate-spin"
          >
            <animate
              attributeName="stroke"
              values="hsl(var(--primary));hsl(var(--destructive));hsl(var(--destructive))"
              dur="2s"
              fill="freeze"
            />
            <animate attributeName="stroke-dasharray" values="120 240;60 300;30 330" dur="2s" fill="freeze" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 100 100;360 100 100;360 100 100"
              dur="2s"
              fill="freeze"
            />
          </circle>
        </g>

        {/* X mark that appears */}
        <g
          className={`transition-all duration-500 delay-1000 ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
        >
          <circle cx="100" cy="100" r="25" fill="hsl(var(--destructive))" opacity="0.1" />
          <line
            x1="85"
            y1="85"
            x2="115"
            y2="115"
            stroke="hsl(var(--destructive))"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="115"
            y1="85"
            x2="85"
            y2="115"
            stroke="hsl(var(--destructive))"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* Error particles */}
        <g className="animate-pulse">
          <circle cx="60" cy="60" r="2" fill="hsl(var(--destructive))" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" begin="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="140" r="1.5" fill="hsl(var(--destructive))" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" begin="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="60" r="1" fill="hsl(var(--destructive))" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" begin="2.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  )
}
