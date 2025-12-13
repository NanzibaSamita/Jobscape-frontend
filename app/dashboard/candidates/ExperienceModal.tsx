import { X } from 'lucide-react';
import React from 'react'

export default function ExperienceModal({
    experience,
    closeModal,
    keyIs,
}: {
    experience: {
        title: string;
        dates: string;
    }[];
    closeModal: (key: string) => void;
    keyIs: string;
}) {
    return (
        <div className="relative bg-background overflow-hidden rounded-[2rem] shadow-xl lg:p-8 py-6 px-4">
            <X onClick={() => closeModal(keyIs)} className="absolute cursor-pointer right-3 top-3" size={24} />
            <div className='h-full flex flex-col space-y-4'>
                <div>
                    <h2 className='xl:text-2xl lg:text-xl md:text-lg sm:text-base xs:text-sm text-sm font-semibold'>Experience</h2>
                    <p className='xs:text-sm text-xs font-light text-muted-foreground line-clamp-2'>
                        Here is the experience of the candidate.
                    </p>
                </div>
                <div className='flex-grow overflow-y-auto'>
                    {experience.length > 0 ? (
                        <div className='mt-4 space-y-2'>
                            {experience.map((exp, index) => (
                                <div key={index} className="flex justify-between items-center gap-2">
                                    <section>
                                        <p className='text-sm'>{exp.title}</p>
                                        <ul className="list-disc marker:text-slate-400 pl-5">
                                            <li className='text-xs '>{exp.dates}</li>
                                        </ul>
                                    </section>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-sm text-muted-foreground'>No experience found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
