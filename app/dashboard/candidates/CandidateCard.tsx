import { AiIcon, Insights } from '@/assets/svg'
import NextImage from '@/components/custom-UI/NextImage'
import { Button } from '@/components/ui/button'
import React from 'react'
import { Candidate } from './(index)/page'
import { ArrowUpRight } from 'lucide-react'
import { useUI } from '@/contexts/ui-context'
import ExperienceModal from './ExperienceModal'
import { api } from '@/lib/axios/axios'
import { toast } from 'react-toastify'

export default function CandidateCard({
    candidate,
    jobId
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    candidate: Candidate,
    jobId?: string | null | number
}) {
    const { openModal, closeModal } = useUI();
    const experienceClick = () => {
        openModal("experienceDetails", <ExperienceModal experience={candidate.experience} closeModal={closeModal} keyIs={"experienceDetails"} />)
        // Add your custom logic here, e.g., open a modal with more details
    }

    const handelAddToSequence = (candidate: Candidate) => {
        api.post("/api/v1/sequence/add-candidate", {
            applicant_id: candidate.id,
            job_post_id: jobId
        }).then((res) => {
            if (res?.data?.success) {
                toast.success("Candidate added to sequence successfully");
            } else {
                toast.error(res?.data?.message);
            }
        }).catch((err) => {
            toast.error(err.response?.data?.message || "Failed to add candidate to sequence");
        }).finally(() => {

        })
    }

    return (
        <div>
            <div className='border rounded-lg md:p-4 p-2 space-y-2'>
                <div className='flex justify-between items-center lg:flex-nowrap flex-wrap '>
                    <div className='flex justify-start items-center gap-3'>
                        <div className='w-16 h-16 rounded-lg bg-primary/20 overflow-hidden'>
                            <NextImage
                                src={"/images/candidate.png"}
                                alt="User Icon"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="md:text-lg text-base font-semibold line-clamp-1">Candidate #{candidate.id}</p>
                            <p className="text-xs text-muted-foreground">{candidate.location}</p>
                        </div>
                    </div>
                    <div
                        className='flex justify-start items-center gap-2 md:gap-4 lg:flex-nowrap flex-wrap mt-2 md:mt-0 '
                    >
                        <Button variant={"ghost"}
                            className='bg-dashboard/50 px-2 py-1 text-xs border flex justify-center items-center gap-2'
                        >
                            <AiIcon className='w-6 h-6 text-primary' />
                            Sourced
                        </Button>
                        <Button variant={"ghost"}
                            onClick={() => handelAddToSequence(candidate)}
                            className='px-2 py-1 text-xs text-blue-500 dark:text-muted-foreground border border-blue-300/40'
                        >
                            Add to sequence
                        </Button>
                    </div>
                </div>
                <div className='lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 grid gap-2'>
                    {candidate?.insights.length >= 0 && <div className='w-full border hover:border-transparent rounded-lg p-2'>
                        <section className='flex justify-start gap-1 items-center'>
                            <Insights />
                            <p className='text-xs md:text-sm'>Insights</p>
                        </section>
                        <section className='flex justify-start items-center'>
                            <p className='text-blue-500 text-xs md:text-sm'>{/* {candidate.recommendation}. */}Highly recommended . {' '}</p>
                            <p>{candidate.ai_score}</p>
                        </section>
                        <section>
                            <ul className="list-disc marker:text-yellow-400 pl-5">
                                {
                                    candidate?.insights?.map(({ role, duration }: { role: string; duration: string }, index: number) => (
                                        <li key={index} className="text-xs text-muted-foreground">
                                            {duration}  <span className="text-slate-800 dark:text-muted-foreground font-semibold">{role}</span>
                                        </li>
                                    ))
                                }
                            </ul>
                        </section>
                    </div>}
                    {candidate.education.length >= 0 && <div className='w-full border hover:border-transparent rounded-lg p-2'>
                        <section className=''>

                            <p className='text-xs md:text-sm mb-2'>Educations</p>
                        </section>
                        <section>
                            <div className="">
                                {
                                    candidate?.education?.map(({ degree, dates }: { degree: string; dates: string }, index: number) => (
                                        <div key={index} className="">
                                            <section>
                                                {degree && <p className='text-sm'>{degree}</p>}
                                                {dates && <ul className="list-disc marker:text-slate-400 pl-5">
                                                    <li className='text-xs '>{dates}</li>
                                                </ul>}
                                            </section>
                                        </div>
                                    ))
                                }
                            </div>
                        </section>
                    </div>}
                    {candidate?.experience?.length >= 0 && <div className='w-full border hover:border-transparent rounded-lg p-2'>
                        <section className=''>

                            <p className='text-xs md:text-sm mb-2'>Experience</p>
                        </section>
                        <section>
                            <div onClick={() => experienceClick()} className="">
                                {
                                    candidate?.experience?.slice(0, 2)?.map(({ title, dates }: { title: string; dates: string }, index: number) => (
                                        <div key={index} className="flex justify-between items-center gap-2 cursor-pointer hover:bg-primary/10 rounded-lg">
                                            <section>
                                                <p className='text-sm'>{title ?? ''}</p>
                                                <ul className="list-disc marker:text-slate-400 pl-5">
                                                    <li className='text-xs '>{dates ?? ''}</li>
                                                </ul>
                                            </section>
                                            <ArrowUpRight />
                                        </div>
                                    ))
                                }
                            </div>
                        </section>
                    </div>}

                    {
                        candidate?.skills?.length >= 0 && <div className='w-full border hover:border-transparent rounded-lg p-2'>
                            <section className=''>

                                <p className='text-xs md:text-sm mb-2'>Skill</p>
                            </section>
                            <section>
                                <div className="flex justify-start items-center gap-2 flex-wrap">
                                    {
                                        candidate?.skills?.map((skill: string, index: number) => (
                                            <p key={index} className="line-clamp-1 text-xs bg-dashboard/50 text-blue-800 px-2 py-1 rounded-md">
                                                {skill}
                                            </p>
                                        ))
                                    }
                                </div>
                            </section>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}
