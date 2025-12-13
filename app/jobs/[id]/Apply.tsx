"use client"

import React from 'react'
import BlackYellowStyleButton from '@/components/custom-UI/Buttons/BlackYellowStyleButton';
import { useUI } from '@/contexts/ui-context';
import ApplyModal from '../ApplyModal';

export default function Apply({
    jobId,
    has_screening_test
}: {
    jobId: string;
    has_screening_test: number | boolean | null;
}) {
    const { openModal, closeModal } = useUI();

    return (
        <BlackYellowStyleButton
            title="Apply Job"
            customStyles={{
                button: {
                    padding: "0.01rem 1.5rem"
                }
            }}
            onClick={() => {
                openModal("apply-job", <ApplyModal has_screening_test={has_screening_test} jobId={jobId} keyIs={"apply-job"} closeModal={closeModal} />)
            }}
        />
    )
}
