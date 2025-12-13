"use client"

import { useEffect, useState } from "react"

const blocks = [
    { text: "Web development", color: "yellow", delay: 0 },
    { text: "UI/UX design", color: "dark", delay: 200 },
    { text: "Logistics", color: "yellow", delay: 400 },
    { text: "Sales", color: "dark", delay: 600 },
    { text: "Web design", color: "yellow", delay: 800 },
    { text: "Human resources", color: "yellow", delay: 1000 },
    { text: "Human res sources", color: "yellow", delay: 2000 },
]

export default function StackBlocks() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(prev => !prev); // toggle every 1s
        }, 3000);

        return () => clearInterval(interval);
    }, [])

    return (
        <div className="relative overflow-hidden  h-full">

            {/* Blocks container */}
            <div className="relative w-full max-w-4xl flex-grow h-full">
                {/* Web development */}
                <div
                    className={`absolute bottom-28 -rotate-12 left-[55%] transform -translate-x-1/2 transition-all duration-1000 ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-96 opacity-0"
                        }`}
                    style={{
                        transitionDelay: `${blocks[0].delay}ms`,
                        // transform: isVisible ? "translate(-50%, 0)" : "translate(-50%, -384px)",
                    }}
                >
                    <div className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-full font-medium whitespace-nowrap">
                        Web development
                    </div>
                </div>

                {/* UI/UX design */}
                <div
                    className={`absolute bottom-0 left-12 transition-all duration-1000 ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-96 opacity-0"
                        }`}
                    style={{ transitionDelay: `${blocks[1].delay}ms` }}
                >
                    <div className="bg-slate-700 text-white px-6 py-3 rounded-full font-medium whitespace-nowrap">
                        UI/UX design
                    </div>
                </div>

                {/* Logistics */}
                <div
                    className={`absolute bottom-12 -rotate-[20deg] left-0 transition-all duration-1000 ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-96 opacity-0"
                        }`}
                    style={{ transitionDelay: `${blocks[2].delay}ms` }}
                >
                    <div className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-full font-medium whitespace-nowrap">
                        Logistics
                    </div>
                </div>

                {/* Sales */}
                <div
                    className={`absolute bottom-12 left-[40%] transform -translate-x-1/2 transition-all duration-1000 ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-96 opacity-0"
                        }`}
                    style={{
                        transitionDelay: `${blocks[3].delay}ms`,
                        transform: isVisible ? "translate(-30%, 0)" : "translate(-30%, -384px)",
                    }}
                >
                    <div className="bg-slate-700 text-white px-6 py-3 rounded-full font-medium whitespace-nowrap">Sales</div>
                </div>

                {/* Web design */}
                <div
                    className={`absolute bottom-0 right-0 transition-all duration-1000 ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-96 opacity-0"
                        }`}
                    style={{ transitionDelay: `${blocks[4].delay}ms` }}
                >
                    <div className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-full font-medium whitespace-nowrap">
                        Web design
                    </div>
                </div>

                {/* Human resources */}
                <div
                    className={`absolute bottom-12 right-10 -rotate-45 transition-all duration-1000 ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-96 opacity-0"
                        }`}
                    style={{ transitionDelay: `${blocks[5].delay}ms` }}
                >
                    <div className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-full font-medium whitespace-nowrap">
                        Human resources
                    </div>
                </div>
            </div>
        </div>
    )
}
