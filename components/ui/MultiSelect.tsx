"use client"

import type React from "react"

import { ChevronDown, X } from "lucide-react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Badge } from "./badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface MultiSelectOption {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
}

interface MultiSelectProps {
    options: MultiSelectOption[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    maxCount?: number
    modalPopover?: boolean
    asChild?: boolean
    align?: "start" | "end" | "center"
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
    disabled = false,
    maxCount = 3,
    modalPopover = false,
    asChild = false,
    align = "start",
}: MultiSelectProps) {
    const [open, setOpen] = useState(false)
    console.log(asChild, "asChild");
    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = e.target as HTMLInputElement
        if (input.value === "") {
            if (e.key === "Backspace") {
                onChange(selected.slice(0, -1))
            }
        }
    }

    const selectables = options.filter((option) => !selected.includes(option.value))

    return (
        <Popover open={open} onOpenChange={setOpen} modal={modalPopover}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between text-left font-normal bg-transparent h-10",
                        !selected.length && "text-muted-foreground",
                        className,
                    )}
                    disabled={disabled}
                >
                    <div className="flex gap-1 flex-wrap">
                        {selected.length > 0 ? (
                            <>
                                {selected.length <= maxCount ? (
                                    selected.map((item) => {
                                        const option = options.find((option) => option.value === item)
                                        const IconComponent = option?.icon
                                        return (
                                            <Badge
                                                variant="secondary"
                                                key={item}
                                                className=""
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleUnselect(item)
                                                }}
                                            >
                                                {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                                                {option?.label}
                                                <button
                                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            handleUnselect(item)
                                                        }
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleUnselect(item)
                                                    }}
                                                >
                                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </Badge>
                                        )
                                    })
                                ) : (
                                    <Badge variant="secondary" className="">
                                        {selected.length} selected
                                    </Badge>
                                )}
                            </>
                        ) : (
                            placeholder
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align={align} onEscapeKeyDown={() => setOpen(false)}>
                <Command>
                    <CommandInput placeholder="Search..." onKeyDown={handleKeyDown} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {selectables.map((option) => {
                                const IconComponent = option.icon
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            onChange([...selected, option.value])
                                            setOpen(true)
                                        }}
                                    >
                                        {/* <Check
                                            className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")}
                                        /> */}
                                        {IconComponent && <IconComponent className="mr-2 h-4 w-4 text-muted-foreground" />}
                                        {option.label}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
