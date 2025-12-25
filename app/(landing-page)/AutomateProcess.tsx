import React from 'react'
import image from "@/public/images/automate-process.png";
import fileImage from "@/public/images/FileUploadImage.png";
import aiButtonImage from "@/public/images/aiButtonWhite.png";
import Image from 'next/image'; import {
    ColoredArrow,
    ColoredHalfCircle,
    ColoredSerialArrow,
    PieChart
} from '@/assets/svg';

export default function AutomateProcess() {

    const process = [
        {
            title: "Screen candidates automatically",
            subtitle: "Delivering managed programs across over the tedious tasks of risk.",
            Icon: PieChart
        },
        {
            title: "Schedule interviews",
            subtitle: "Delivering managed programs across over the tedious tasks of risk.",
            Icon: ColoredSerialArrow
        },
        {
            title: "Upload Resume to AI Account",
            subtitle: "Delivering managed programs across over the tedious tasks of risk.",
            Icon: ColoredHalfCircle
        },
        {
            title: "Track candidate progress",
            subtitle: "Delivering managed programs across over the tedious tasks of risk.",
            Icon: ColoredArrow
        }
    ]

    return (
        <div className='container-padding mx-auto border border-transparent lg:mt-[5rem] hidden'>
            <section className='lg:grid md:grid-cols-[45%_53%] lg:gap-4'>
                <div className="relative w-full px-4">
                    <Image
                        src={image.src}
                        alt="Automate Process"
                        className="w-full rounded-md"
                        width={383}
                        height={516}
                    />
                    <Image
                        src={fileImage.src}
                        alt="File Upload"
                        className="absolute bottom-6 left-0 md:-translate-x-7"
                        width={170}
                        height={120}
                    />
                    <Image
                        src={aiButtonImage.src}
                        alt="Ai Button"
                        className="absolute bottom-9 z-10 right-0 md:translate-x-6"
                        width={170}
                        height={12}
                    />
                </div>
                <div className="w-full pl-6 flex flex-col justify-start items-start mt-4 lg:mt-0">
                    <p className='text-slate-200 text-2xl lg:text-[2.8125rem] leading-8 lg:leading-[3.5625rem] font-semibold'>Automate Your Recruiting Process with Wanted.Ai</p>
                    <div className='flex-grow w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {
                            process.map(({ title, subtitle, Icon }, index) => {
                                if (!title || !subtitle || !Icon) return null;
                                return (
                                    <div className='flex items-start flex-col gap-4' key={index}>
                                        <div className='h-12 w-12'>
                                            <Icon className='h-full w-full' />
                                        </div>
                                        <div className='gap-3 flex flex-col justify-start items-start'>
                                            <p className='text-slate-200 text-base font-medium'>{title}</p>
                                            <p className='text-slate-300 text-xs'>{subtitle}</p>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </section>
        </div>
    )
}
