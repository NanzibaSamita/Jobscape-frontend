"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"

interface RangeSliderProps {
    min?: number
    max?: number
    step?: number
    value?: [number, number]
    defaultValue?: [number, number]
    onValueChange?: (value: [number, number]) => void
    className?: string
    disabled?: boolean
    hideRange?: boolean
}

export function RangeSlider({
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue = [min, max],
    onValueChange,
    className = "",
    disabled = false,
    hideRange = false,
}: RangeSliderProps) {
    const [internalValue, setInternalValue] = useState<[number, number]>(defaultValue)
    const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null)
    const sliderRef = useRef<HTMLDivElement>(null)

    // Use controlled value if provided, otherwise use internal state
    const currentValue = value !== undefined ? value : internalValue
    const getPercentage = useCallback(
        (val: number) => {
            return ((val - min) / (max - min)) * 100
        },
        [min, max],
    )

    const getValue = useCallback(
        (percentage: number) => {
            const rawValue = min + (percentage / 100) * (max - min)
            return Math.round(rawValue / step) * step
        },
        [min, max, step],
    )

    const updateValue = useCallback(
        (newValue: [number, number]) => {
            // Only update internal state if not controlled
            if (value === undefined) {
                setInternalValue(newValue)
            }
            // Always call the callback if provided
            onValueChange?.(newValue)
        },
        [value, onValueChange],
    )

    const handleMouseDown = useCallback(
        (type: "min" | "max") => (e: React.MouseEvent) => {
            if (disabled) return
            e.preventDefault()
            setIsDragging(type)
        },
        [disabled],
    )

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !sliderRef.current || disabled) return

            const rect = sliderRef.current.getBoundingClientRect()
            const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
            const newValue = getValue(percentage)

            const newRange: [number, number] =
                isDragging === "min"
                    ? [Math.min(newValue, currentValue[1]), currentValue[1]]
                    : [currentValue[0], Math.max(newValue, currentValue[0])]

            updateValue(newRange)
        },
        [isDragging, getValue, currentValue, updateValue, disabled],
    )

    const handleMouseUp = useCallback(() => {
        setIsDragging(null)
    }, [])

    const handleTouchStart = useCallback(
        (type: "min" | "max") => (e: React.TouchEvent) => {
            if (disabled) return
            e.preventDefault()
            setIsDragging(type)
        },
        [disabled],
    )

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isDragging || !sliderRef.current || disabled) return

            const rect = sliderRef.current.getBoundingClientRect()
            const touch = e.touches[0]
            const percentage = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100))
            const newValue = getValue(percentage)

            const newRange: [number, number] =
                isDragging === "min"
                    ? [Math.min(newValue, currentValue[1]), currentValue[1]]
                    : [currentValue[0], Math.max(newValue, currentValue[0])]

            updateValue(newRange)
        },
        [isDragging, getValue, currentValue, updateValue, disabled],
    )

    const handleTouchEnd = useCallback(() => {
        setIsDragging(null)
    }, [])

    // Add event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
            document.addEventListener("touchmove", handleTouchMove)
            document.addEventListener("touchend", handleTouchEnd)

            return () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
                document.removeEventListener("touchmove", handleTouchMove)
                document.removeEventListener("touchend", handleTouchEnd)
            }
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

    const minPercentage = getPercentage(currentValue[0])
    const maxPercentage = getPercentage(currentValue[1])
    return (
        <div className={`relative w-full ${className}`}>
            {/* Track */}
            <div
                ref={sliderRef}
                className={`relative h-2 bg-gray-200 rounded-full cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                {/* Selected range */}
                <div
                    className="absolute h-full bg-yellow-400 rounded-full"
                    style={{
                        left: `${minPercentage}%`,
                        width: `${maxPercentage - minPercentage}%`,
                    }}
                />

                {/* Min handle */}
                <div
                    className={`absolute top-1/2 w-5 h-5 bg-white border-2 border-yellow-400 rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2 cursor-grab ${isDragging === "min" ? "cursor-grabbing scale-110" : ""
                        } ${disabled ? "cursor-not-allowed" : "hover:scale-110"} transition-transform duration-150`}
                    style={{ left: `${minPercentage}%` }}
                    onMouseDown={handleMouseDown("min")}
                    onTouchStart={handleTouchStart("min")}
                    role="slider"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={currentValue[0]}
                    aria-label="Minimum value"
                    tabIndex={disabled ? -1 : 0}
                />

                {/* Max handle */}
                <div
                    className={`absolute top-1/2 w-5 h-5 bg-white border-2 border-yellow-400 rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2 cursor-grab ${isDragging === "max" ? "cursor-grabbing scale-110" : ""
                        } ${disabled ? "cursor-not-allowed" : "hover:scale-110"} transition-transform duration-150`}
                    style={{ left: `${maxPercentage}%` }}
                    onMouseDown={handleMouseDown("max")}
                    onTouchStart={handleTouchStart("max")}
                    role="slider"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={currentValue[1]}
                    aria-label="Maximum value"
                    tabIndex={disabled ? -1 : 0}
                />
            </div>

            {/* Value display */}
            {!hideRange && <div className="flex justify-between mt-2 text-xs text-gray-600 font-thin">
                <span>{currentValue[0]}BDT</span>
                <span>{currentValue[1]}BDT</span>
            </div>}
        </div>
    )
}
