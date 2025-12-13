"use client"

import React from 'react'
import BlackYellowStyleButton from '@/components/custom-UI/Buttons/BlackYellowStyleButton';
import { useRouter } from 'next/navigation';

export default function ApplyFake({

}) {
    const router = useRouter();
    return (
        <BlackYellowStyleButton
            title="Apply Job"
            customStyles={{
                button: {
                    padding: "0.01rem 1.5rem"
                }
            }}
            onClick={() => {
                router.push(`/signup`);
            }}
        />
    )
}
