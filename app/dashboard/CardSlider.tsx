import { ArrowLeft, ArrowRight } from 'lucide-react';
import React from 'react'

export default function CardSlider({
    title = "Card Slider",
    children,
}: {
    title?: string;
    children: React.ReactNode;
}) {
    const sliderRef = React.useRef<HTMLDivElement>(null);

    function handelClick(isLeft: boolean) {
        if (!sliderRef.current) return;

        const scrollAmount = 300; // Adjust this value to control the scroll distance
        const currentScroll = sliderRef.current.scrollLeft;

        if (isLeft) {
            sliderRef.current.scrollTo({
                left: currentScroll - scrollAmount,
                behavior: 'smooth',
            });
        } else {
            sliderRef.current.scrollTo({
                left: currentScroll + scrollAmount,
                behavior: 'smooth',
            });
        }
    }

    return (
        <div className='w-full'>
            <div className='flex items-center justify-between'>
                <p className='md:text-2xl text-xl md:font-semibold font-medium'>{title}</p>
                <div className='flex items-center justify-end gap-4'>
                    <div
                        className='md:w-10 md:h-10 w-9 h-9 border bg-slate-300/40 rounded-full items-center flex justify-center cursor-pointer hover:bg-slate-300/80'
                        onClick={() => handelClick(true)}
                    >
                        <ArrowLeft size={25} strokeWidth={2} />
                    </div>
                    <div
                        className='md:w-10 md:h-10 w-9 h-9 border bg-slate-300/40 rounded-full items-center flex justify-center cursor-pointer hover:bg-slate-300/80'
                        onClick={() => handelClick(false)}
                    >
                        <ArrowRight size={25} strokeWidth={2} />
                    </div>
                </div>
            </div>
            <div ref={sliderRef} className='flex overflow-x-auto gap-4 py-4 px-2 scrollbar-hide max-w-full'>
                {
                    children
                }
            </div>
        </div>
    )
}
