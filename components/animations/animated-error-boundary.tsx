"use client"

import { useEffect, useState } from "react"

export function AnimatedErrorBoundary() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <svg viewBox="0 0 300 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0.3" />
          </linearGradient>

          <filter id="shake">
            <feOffset in="SourceGraphic" dx="0" dy="0">
              <animate attributeName="dx" values="0;2;-2;0" dur="0.1s" repeatCount="indefinite" />
            </feOffset>
          </filter>
        </defs>

        {/* Broken screen effect */}
        <g className={`transition-all duration-800 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          {/* Screen outline */}
          <rect
            x="50"
            y="40"
            width="200"
            height="120"
            rx="10"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="3"
          />

          {/* Crack lines */}
          <g className="animate-pulse">
            <path
              d="M 80 60 L 150 100 L 220 80 L 180 140"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 120 50 L 160 90 L 200 120"
              stroke="hsl(var(--destructive))"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M 70 100 L 110 80 L 140 130"
              stroke="hsl(var(--destructive))"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
          </g>

          {/* Warning triangle in center */}
          <g
            className={`transition-all duration-1000 delay-500 ${isVisible ? "scale-100" : "scale-0"}`}
            filter="url(#shake)"
          >
            <path
              d="M 150 80 L 170 120 L 130 120 Z"
              fill="url(#errorGradient)"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
            />
            <line x1="150" y1="90" x2="150" y2="110" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="150" cy="115" r="2" fill="white" />
          </g>

          {/* Sparks/debris */}
          <g className="animate-bounce">
            <circle cx="90" cy="70" r="1.5" fill="hsl(var(--destructive))" opacity="0.6">
              <animate attributeName="cy" values="70;60;70" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="210" cy="90" r="1" fill="hsl(var(--destructive))" opacity="0.4">
              <animate attributeName="cy" values="90;80;90" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="180" cy="150" r="1.5" fill="hsl(var(--destructive))" opacity="0.5">
              <animate attributeName="cy" values="150;140;150" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>

        {/* Error message simulation */}
        <g className={`transition-all duration-1000 delay-800 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <rect x="60" y="170" width="80" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <rect x="60" y="180" width="120" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <rect x="60" y="190" width="60" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.3" />
        </g>
      </svg>
    </div>
  )
}
