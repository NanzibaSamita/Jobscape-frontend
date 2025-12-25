import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ArrowRight, Bookmark } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function JobCard({
    id,
    icon,
    jobTitle,
    salaryRange,
    companyName,
    location,
    jobType,
    marked = false
}: {
    id: string | number;
    icon?: React.ReactNode | string;
    jobTitle?: string;
    salaryRange?: string;
    companyName?: string;
    location?: string;
    jobType?: string;
    marked?: boolean;
}) {
    const router = useRouter();
    return (
        <Card className='min-w-full max-w-full md:min-w-96 md:max-w-96  px-5 py-4 space-y-3 shadow-none relative'>
            <CardHeader className='p-0'>
                <div className='flex justify-start items-center gap-2'>
                    {
                        location && <div className='border rounded-sm px-2 py-1 max-w-24'>
                            <p className='text-xs text-center line-clamp-1 text-ellipsis'>{location}</p>
                        </div>
                    }
                    {
                        jobType && <div className='border rounded-sm px-2 py-1 max-w-24'>
                            <p className='text-xs text-center line-clamp-1 text-ellipsis'>{jobType}</p>
                        </div>
                    }
                </div>
            </CardHeader>
            <CardContent className='p-0'>
                {marked && <div className='absolute top-0 right-0'>
                    <Bookmark className='fill-primary text-primary' /></div>}
                <div className='space-y-2'>
                    <div className='flex justify-start items-center gap-3'>
                        <div className='w-8 h-8 rounded-full overflow-hidden border-2'>
                            <Image
                                src={typeof icon === 'string' ? icon : '/images/placeholder.png'}
                                alt="Company Icon"
                                width={30}
                                height={30}
                                className='rounded-full w-full h-full'
                            />
                        </div>
                        <p className='md:text-2xl text-base font-semibold'>{jobTitle}</p>
                    </div>
                    <div className='flex flex-wrap justify-start items-center gap-2 text-sm font-normal'>
                        <p className=''>{companyName} |</p>
                        <p> {salaryRange} BDT</p>
                    </div>

                </div>
            </CardContent>
            <CardFooter className='p-0'>
                <Button
                    onClick={() => router.push(`/jobs/${id}`)}
                    variant={"outline"}
                    className='border-0 shadow-none p-0 font-semibold md:text-lg text-sm flex justify-start items-center gap-2 hover:text-gray-400/30 hover:bg-transparent hover:shadow-none'
                >
                    Apply Now
                    <ArrowRight className='h-4 w-4' />
                </Button>
            </CardFooter>
        </Card>
    )
}
