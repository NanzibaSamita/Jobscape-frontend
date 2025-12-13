import NextImage from '@/components/custom-UI/NextImage';
import { useRouter } from 'next/navigation';
import React from 'react'
import success from "@/assets/gif/success.gif"

export default function CompleteScreening({
    keyIs,
    closeModal,

}: {
    keyIs: string;
    closeModal: (str: string) => void;
}) {
    const router = useRouter();
    return (
        <div onClick={() => {
            router.push("/applied-jobs");
            closeModal(keyIs)
        }} className="lg:max-h-[24rem] space-y-5 max-h-full xl:w-[30rem] lg:w-[35rem] md:w-[30rem] sm:w-[28rem] xs:max-w-full bg-dashboard-foreground overflow-y-auto p-6">
            <div className='w-28 h-28 rounded-full mx-auto'>
                <NextImage
                    src={success.src}
                    alt="Screening Complete"
                    width={200}
                    height={200}
                    className="mx-auto mb-4 rounded-full"
                />
            </div>
            <>
                <h2 className='lg:text-2xl font-semibold text-xl text-center'>We have received your application</h2>
                <p className='lg:text-2xl font-semibold text-xl text-primary text-center'>Best of Luck</p>
            </>
        </div>
    )
}
