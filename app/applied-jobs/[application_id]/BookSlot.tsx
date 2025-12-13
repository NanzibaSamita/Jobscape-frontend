"use client"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'


export default function BookSlot({ jobId }: { jobId: number | string }) {
    const router = useRouter();
    return (
        <Button onClick={() => router.push(`/jobs/book-slot/${jobId}`)} variant='outline'>
            Book Slot
        </Button>
    )
}
