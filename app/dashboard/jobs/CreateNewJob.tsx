"use client"
import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton'
import { useRouter } from 'next/navigation';
import React from 'react'

export default function CreateNewJob() {
    const router = useRouter();
    return (
        <BlackStyleButton
            title="Create New Job"
            customStyles={{
                button: {
                    padding: "0.01rem 1.5rem"
                }
            }}
            onClick={() => router.push("/dashboard/create-job")}
        />
    )
}
