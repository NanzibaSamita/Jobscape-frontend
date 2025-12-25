"use client"

import { useEffect, useState } from "react"

export function Animated500() {
  const [isVisible, setIsVisible] = useState(false)
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    setIsVisible(true)

    // Generate random sparkles
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 400,
      y: Math.random() * 200,
      delay: Math.random() * 2,
    }))
    setSparkles(newSparkles)
  }, [])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Background warning pattern */}
        <defs>
          <pattern id="warningPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="hsl(var(--destructive))" opacity="0.05" />
            <path d="M 0 20 L 20 0" stroke="hsl(var(--destructive))" strokeWidth="1" opacity="0.1" />
          </pattern>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="400" height="200" fill="url(#warningPattern)" />

        {/* 5 */}
        <g
          className={`transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
        >
          <path
            d="M 60 60 L 60 140 L 120 140 L 120 100 L 100 100 L 100 80 L 140 80"
            stroke="hsl(var(--destructive))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#glow)"
          >
            <animate attributeName="strokeOpacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </path>
        </g>

        {/* 0 with warning symbol */}
        <g
          className={`transition-all duration-1000 delay-300 ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
        >
          <circle
            cx="200"
            cy="100"
            r="40"
            stroke="hsl(var(--destructive))"
            strokeWidth="8"
            fill="none"
            filter="url(#glow)"
          >
            <animate attributeName="strokeOpacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Warning triangle inside */}
          <g className="animate-bounce">
            <path d="M 200 85 L 210 110 L 190 110 Z" fill="hsl(var(--destructive))" opacity="0.8" />
            <circle cx="200" cy="115" r="2" fill="hsl(var(--destructive))" />
          </g>
        </g>

        {/* 0 */}
        <g
          className={`transition-all duration-1000 delay-600 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          <circle
            cx="300"
            cy="100"
            r="40"
            stroke="hsl(var(--destructive))"
            strokeWidth="8"
            fill="none"
            filter="url(#glow)"
          >
            <animate attributeName="strokeOpacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Error sparkles/glitches */}
        {sparkles.map((sparkle) => (
          <g key={sparkle.id}>
            <circle cx={sparkle.x} cy={sparkle.y} r="1" fill="hsl(var(--destructive))">
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.5s"
                begin={`${sparkle.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="1;3;1"
                dur="1.5s"
                begin={`${sparkle.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Glitch lines */}
        <g className="animate-pulse">
          <line x1="50" y1="120" x2="150" y2="120" stroke="hsl(var(--destructive))" strokeWidth="2" opacity="0.3">
            <animate attributeName="x2" values="150;140;150" dur="0.5s" repeatCount="indefinite" />
          </line>
          <line x1="250" y1="80" x2="350" y2="80" stroke="hsl(var(--destructive))" strokeWidth="2" opacity="0.3">
            <animate attributeName="x1" values="250;260;250" dur="0.7s" repeatCount="indefinite" />
          </line>
        </g>

        {/* Warning pulse effect */}
        <circle cx="200" cy="100" r="60" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" opacity="0.2">
          <animate attributeName="r" values="60;80;60" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}
