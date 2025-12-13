import Background from '@/assets/svg/Background'
import BlackWhiteStyleButton from '@/components/custom-UI/Buttons/BlackWhiteStyleButton'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function PlanCard() {
    const router = useRouter()
    return (
        <div className='w-full h-full border rounded-2xl p-4 bg-primary dark:bg-primary space-y-4'>
            <div className='mx-auto max-w-min'>
                <Background />
            </div>
            <p className='text-center font-bold text-2xl mb-2'>
                See jobs where you’d
                be a top talent
            </p>
            <div className='flex items-center justify-center space-x-4'>
                <BlackWhiteStyleButton onClick={() => router.push('/plan-details')} title={"Upgrade Plan"} />
            </div>
        </div>
    )
}
