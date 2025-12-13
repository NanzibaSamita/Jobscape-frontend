"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export default function Range({ showGraph = true }: { showGraph?: boolean }) {
    const [range, setRange] = useState([85, 120])
    const [isDragging, setIsDragging] = useState<"left" | "right" | null>(null)
    const trackRef = useRef<HTMLDivElement>(null)

    // Sample data for histogram - representing salary distribution
    const histogramData = [
        { value: 60, height: 25 },
        { value: 65, height: 40 },
        { value: 70, height: 55 },
        { value: 75, height: 70 },
        { value: 80, height: 80 },
        { value: 85, height: 90 },
        { value: 90, height: 95 },
        { value: 95, height: 100 },
        { value: 100, height: 100 },
        { value: 105, height: 95 },
        { value: 110, height: 90 },
        { value: 115, height: 80 },
        { value: 120, height: 70 },
        { value: 125, height: 55 },
        { value: 130, height: 40 },
        { value: 135, height: 30 },
        { value: 140, height: 20 },
    ]

    const maxHeight = Math.max(...histogramData.map((d) => d.height))
    const minValue = 60
    const maxValue = 140

    // Calculate positions for the range selectors
    const getPositionPercentage = (value: number) => {
        return ((value - minValue) / (maxValue - minValue)) * 100
    }

    const getValueFromPosition = (percentage: number) => {
        const value = minValue + (percentage / 100) * (maxValue - minValue)
        return Math.round(value / 5) * 5 // Round to nearest 5
    }

    const leftPosition = getPositionPercentage(range[0])
    const rightPosition = getPositionPercentage(range[1])

    const handleMouseDown = (side: "left" | "right") => {
        setIsDragging(side)
    }

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !trackRef.current) return

            const rect = trackRef.current.getBoundingClientRect()
            const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
            const newValue = getValueFromPosition(percentage)

            setRange((prev) => {
                if (isDragging === "left") {
                    return [Math.min(newValue, prev[1] - 5), prev[1]]
                } else {
                    return [prev[0], Math.max(newValue, prev[0] + 5)]
                }
            })
        },
        [isDragging],
    )

    const handleMouseUp = useCallback(() => {
        setIsDragging(null)
    }, [])

    // Add event listeners when dragging starts
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)

            return () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
            }
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
        <div className="w-full lg:max-w-md max-w-[302px] p-6 space-y-6 bg-background rounded-lg border">
            <div className="space-y-4">
                {/* Histogram with range selectors */}
                <div className="relative">
                    {/* Histogram bars */}
                    {showGraph && <div className="h-20 flex items-end justify-center space-x-1 px-4 mb-4">
                        {histogramData.map((bar, index) => {
                            const heightPercentage = (bar.height / maxHeight) * 100
                            const isInRange = bar.value >= range[0] && bar.value <= range[1]

                            return (
                                <div
                                    key={index}
                                    className={`w-2.5 rounded-sm transition-colors ${isInRange ? "bg-blue-500" : "bg-blue-300"}`}
                                    style={{ height: `${heightPercentage}%` }}
                                />
                            )
                        })}
                    </div>}

                    {/* Range selector track */}
                    <div ref={trackRef} className="relative h-6 mx-4">
                        {/* Track line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>

                        {/* Active range line */}
                        <div
                            className="absolute top-1/2 h-0.5 bg-blue-500 transform -translate-y-1/2"
                            style={{
                                left: `${leftPosition}%`,
                                width: `${rightPosition - leftPosition}%`,
                            }}
                        ></div>

                        {/* Left range selector */}
                        <div
                            className={`absolute top-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-sm transform -translate-y-1/2 -translate-x-1/2 cursor-grab hover:scale-110 transition-transform ${isDragging === "left" ? "cursor-grabbing scale-110" : ""
                                }`}
                            style={{ left: `${leftPosition}%` }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                handleMouseDown("left")
                            }}
                        ></div>

                        {/* Right range selector */}
                        <div
                            className={`absolute top-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-sm transform -translate-y-1/2 -translate-x-1/2 cursor-grab hover:scale-110 transition-transform ${isDragging === "right" ? "cursor-grabbing scale-110" : ""
                                }`}
                            style={{ left: `${rightPosition}%` }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                handleMouseDown("right")
                            }}
                        ></div>
                    </div>

                    {/* Range labels */}
                    <div className="relative mt-2 px-4">
                        <div
                            className="absolute text-sm font-medium text-gray-700"
                            style={{ left: `${leftPosition}%`, transform: "translateX(-50%)" }}
                        >
                            {range[0]}k
                        </div>
                        <div
                            className="absolute text-sm font-medium text-gray-700"
                            style={{ left: `${rightPosition}%`, transform: "translateX(-50%)" }}
                        >
                            {range[1]}k
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
