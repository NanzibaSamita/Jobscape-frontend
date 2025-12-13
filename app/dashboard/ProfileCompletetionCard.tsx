import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton';
import ProgressCardHalf from '@/components/ui/ProgressCardHalf';
import { useAppSelector } from '@/lib/store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function ProfileCompetitionCard({
    complete,
    inComplete,
}: {
    complete: number;
    inComplete: number;
}) {
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);
    return (
        <div className='h-full w-full border rounded-xl p-3 md:mt-0 mt-4'>
            <div className='w-24 h-24 border rounded-full mx-auto'>
                <Image
                    src={typeof user?.user_image === 'string' ? user?.user_image : '/images/placeholder.png'}
                    alt="Company Icon"
                    width={30}
                    height={30}
                    className='rounded-full w-full h-full'
                />
            </div>
            <div>
                <p className='text-center md:text-xl text-base line-clamp-1 text-ellipsis font-medium'>{user?.user_first_name ?? ""} {user?.user_last_name ?? ""}</p>
                <p className='text-center md:text-base text-xs line-clamp-1 text-ellipsis font-light text-muted-foreground'>Software Engineer</p>
            </div>
            <div className='md:w-60 w-36 mx-auto'>
                <ProgressCardHalf
                    completionPercentage={complete}
                >
                    <div className="md:text-3xl text-lg font-bold text-gray-900">{complete}%</div>
                    <div className="bg-red-100 text-red-500 text-xs font-medium md:px-3 px-2 md:py-1 rounded-full">
                        -{inComplete}%
                    </div>
                </ProgressCardHalf>
                <p className='text-center md:text-sm text-xs text-ellipsis font-light text-muted-foreground'>You&apos;re almost there — 60% done! Complete your profile to stand out.</p>
                <div className='mt-2 mx-auto max-w-min cursor-pointer'>
                    <BlackStyleButton onClick={() => router.push("/profile")} title="Complete Profile" />
                </div>
            </div>
        </div>
    )
}
