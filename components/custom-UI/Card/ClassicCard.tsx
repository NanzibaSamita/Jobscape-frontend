import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

export default function CourseCard({
  title = "Course Title",
  companyName = "Company Name",
  companyIcon = "",
  certificateType = "Certificate Type",
  courseLink = "#",
  courseBanner = "/images/placeholder.png",
}: {
  title: string;
  companyName: string;
  companyIcon: string | null | undefined;
  certificateType: string;
  courseLink: string;
  courseBanner: string | null | undefined;
}) {
  return (
    <Link href={courseLink} target='_blank' className='no-underline'>
      <Card className='min-w-full max-w-full md:min-w-96 md:max-w-96 p-2 space-y-4 shadow-none'>
        <CardHeader className='p-0 border rounded-md relative'>
          <div className='md:w-auto w-auto h-32 md:h-48'>
            <Image
              src={typeof courseBanner === 'string' ? courseBanner : '/images/placeholder.png'}
              alt="Company Icon"
              width={310}
              height={190}
              className='w-full h-full object-fit'
            />
          </div>
        </CardHeader>
        <CardContent className='px-2 py-0'>
          <div className='space-y-2'>
            <div className='flex justify-start items-center gap-3 text-muted-foreground text-base font-extralight'>
              <div className='md:w-12 w-10 h-10 md:h-12rounded-sm'>
                <Image
                  src={typeof companyIcon === 'string' ? companyIcon : '/images/placeholder.png'}
                  alt="Company Icon"
                  width={310}
                  height={190}
                  className='w-full h-full object-fit'
                />
              </div>
              <p>
                {companyName}
              </p>
            </div>
            <div>
              <p className='md:text-xl text-sm font-medium'>{title}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className='px-2 py-0'>
          <div className='flex flex-wrap justify-start items-center gap-2 text-sm font-normal mb-3'>
            <p className='text-muted-foreground font-light'>{certificateType}</p>
          </div>
        </CardFooter>
      </Card></Link>
  )
}
