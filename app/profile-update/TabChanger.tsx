/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { ChevronRight } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function TabChanger({ user, tabs, active, setActive }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tabs: any[],
    active: string,
    setActive: (tab: string) => void,
}) {
    return (
        <div>
            {
                tabs.map((key: string) => {
                    return <div
                        key={key} 
                        // onClick={() => {
                        //     setActive(key);
                        // }}
                        className={`border bg-linear/20 flex justify-between items-center rounded-lg py-2 px-4 my-2 select-none hover:bg-primary/10  ${active === key ? "bg-primary/10" : "bg-transparent text-muted-foreground"}`}>
                        <p  >{key}</p>
                        <ChevronRight
                            className={`h-4 w-4 transition-transform ${active === key ? "text-yellow-600" : "text-gray-400"
                                }`}
                        />
                    </div>
                })
            }
        </div>
    )
}
