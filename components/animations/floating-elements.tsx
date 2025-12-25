"use client"

import { useEffect, useState } from "react"

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  color: string
}

export function FloatingElements({ count = 6 }: { count?: number }) {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    const newElements = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      color: Math.random() > 0.5 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
    }))
    setElements(newElements)
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {elements.map((element) => (
          <circle
            key={element.id}
            cx={`${element.x}%`}
            cy={`${element.y}%`}
            r={element.size}
            fill={element.color}
            opacity="0.3"
          >
            <animate
              attributeName="cy"
              values={`${element.y}%;${element.y - 10}%;${element.y}%`}
              dur={`${element.duration}s`}
              begin={`${element.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur={`${element.duration}s`}
              begin={`${element.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  )
}
