import React from 'react'
import profileCard from "@/public/images/profile-card.png";
import taskCard from "@/public/images/task-card.png";
import statCard from "@/public/images/statCard.png";
import listItem from "@/public/images/listItem.png";

import Image from 'next/image';
import WhiteStyleButton from '@/components/custom-UI/Buttons/WhiteStyleButton';
import StarButton from '@/components/custom-UI/Buttons/StarButton';
import { AiIcon } from '@/assets/svg';
export default function CandidateScreening() {
    return (
        <div className='container-padding mx-auto lg:mt-[5rem] hidden'>
            <section className='mt-4 lg:mt-0'>
                <p className='text-2xl md:text-5xl lg:text-5xl font-medium  text-[#D9D9D9] text-center'>Screen candidates fast and
                    <br />
                    fair with your team</p>
            </section>
            <section className='grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4 lg:mt-16'>
                <div className="border border-slate-500/40 rounded-lg p-8 w-full lg:col-span-3 block lg:flex justify-between items-center gap-4">
                    <div>
                        <p className='text-[#D9D9D9] text-xl font-medium'>Structure your interviews with custom scorecards</p>
                        <p className='text-[#D9D9D9] text-sm mt-2'>Identify the best talent easily by assessing candidates based on the skills that matter to you. Collaborate on scorecards to find new colleagues.</p>
                        <div className='max-w-min md:block hidden my-7'>
                            <WhiteStyleButton
                                title="Get Started"
                            />
                        </div>
                    </div>
                    <div className='h-full flex lg:items-end items-start'>
                        <Image
                            src={profileCard.src}
                            alt="Profile Card"
                            width={750}
                            height={200}
                        />
                    </div>
                </div>
                <div className="border border-slate-500/40 rounded-lg w-full lg:col-span-2 p-8">
                    <p className='text-[#D9D9D9] text-xl font-medium'>Take the back-and-forth out of interview scheduling</p>
                    <p className='text-[#D9D9D9] text-sm mt-2'>No more endless email threads. Streamline your interview scheduling to reduce time-to-interview and connect with talent faster.</p>
                    <div className='mt-4'>
                        <Image
                            src={taskCard.src}
                            alt="Task Card"
                            width={400}
                            height={200}
                        />
                    </div>
                </div>
            </section>
            <section className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'>
                <div className="border border-slate-500/40 rounded-lg w-full p-8">
                    <p className='text-[#D9D9D9] text-xl font-medium'>Involve the right team members for each role</p>
                    <p className='text-[#D9D9D9] text-sm mt-2'>Set up roles and permissions for your colleagues and start hiring together.</p>
                    <div className='mt-4'>
                        <Image
                            src={statCard.src}
                            alt="Task Card"
                            width={200}
                            height={200}
                            className='mx-auto blur-mask-bottom'
                        />
                    </div>
                </div>
                <div className="border border-slate-500/40 rounded-lg w-full p-8">
                    <p className='text-[#D9D9D9] text-xl font-medium'>Craft effective job ads in minutes</p>
                    <p className='text-[#D9D9D9] text-sm mt-2'>Enjoy AI-assisted job ad creation that helps you build compelling job ads faster.</p>
                    <div className='mt-4 relative'>
                        <Image
                            src={listItem.src}
                            alt="Task Card"
                            width={200}
                            height={200}
                            className='mx-auto blur-mask-bottom'
                        />
                        <div className='absolute bottom-0 min-w-max -translate-x-1/2 left-1/2 rounded-full border-red-400'>
                            <StarButton>
                                <p className="bg-black min-w-max rounded-full overflow-hidden px-4 py-1 text-white font-light flex justify-center items-center gap-2">
                                    <AiIcon className="w-6 h-6" />
                                    Create job ad with AI
                                </p>
                            </StarButton>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    )
}
