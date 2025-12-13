"use client";
import WhiteStyleButton from '@/components/custom-UI/Buttons/WhiteStyleButton';
import { useAppSelector } from '@/lib/store';
import { useRouter } from 'next/navigation';
import React from 'react'
import { shallowEqual } from 'react-redux';

export default function HireButton() {
    const { user, roleWeight } = useAppSelector((state) => ({ user: state.auth.user, roleWeight: state.auth.roleWeight }), shallowEqual);
    const router = useRouter();

    if ((roleWeight?.toString() !== "95") && user) return null; // Hide button for recruiters
    return (
        <div onClick={() => router.push("/dashboard/create-job")} className='max-w-min'>
            <WhiteStyleButton
                title="Hire Top Talent"
                customStyles={{
                    text1: {
                        fontSize: "16px",
                        fontWeight: "500"
                    },
                    text2: {
                        fontSize: "16px",
                        fontWeight: "500"
                    },
                    button: {
                        padding: "0.2rem 0.5rem"
                    }
                }}
            />
        </div>
    )
}
