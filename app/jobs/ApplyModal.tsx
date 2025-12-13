// import { AiIcon } from '@/assets/svg';
import BlackYellowStyleButton from '@/components/custom-UI/Buttons/BlackYellowStyleButton';
// import StarButton from '@/components/custom-UI/Buttons/StarButton';
import WhiteStyleButton from '@/components/custom-UI/Buttons/WhiteStyleButton';
import { Label } from '@/components/ui/label';
import { useUI } from '@/contexts/ui-context';
import { api } from '@/lib/axios/axios';
// import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify';
import CompleteScreening from '../screening/[job_id]/CompleteScreening';

const AI_COVER_LETTER = "/api/v1/cover-letter-suggest-ai";
const APPLICATION_STORE = "/api/v1/job-application-store";

export default function ApplyModal({
    closeModal,
    jobId,
    keyIs = "apply-job",
    has_screening_test
}: {
    closeModal: (key: string) => void;
    jobId: string;
    keyIs?: string;
    has_screening_test: number | boolean | null;
}) {
    const textRef = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { openModal } = useUI();

    const onSave = () => {
        const coverLetter = textRef.current ? textRef.current.value : "";
        setLoading(true);
        api.post(APPLICATION_STORE, {
            cover_letter: coverLetter,
            job_post_id: jobId,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(() => {
                closeModal(keyIs);
                toast.success("Application submitted successfully!");
                if (has_screening_test) {
                    return router.push(`/screening/${jobId}`);
                } else {
                    openModal("no-screening-questions", <CompleteScreening keyIs={"no-screening-questions"} closeModal={closeModal} />)
                }
            })
            .catch((error) => {
                console.error("Update failed:", error);
                const msg =
                    error?.response?.data?.message ||
                    "Something went wrong while updating profile.";
                toast.error(msg);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    async function getLaterFromAI() {
        setLoading(true);
        try {
            const res = await api.post(AI_COVER_LETTER, {
                job_id: jobId,
            });
            if (textRef.current && res.data.data) {
                // const values = markdownToHtml(res.data.data);
                // console.log("AI Cover Letter:", { values });
                textRef.current.value = res.data.data;
            } else {
                console.error("No data received from AI Cover Letter API");
                toast.error("Failed to get cover letter from AI.");
            }
        } catch (error: unknown) {
            console.error("Update failed:", error);
            const msg =
                (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response && error.response.data && typeof error.response.data === "object" && "message" in error.response.data)
                    ? (error as { response: { data: { message?: string } } }).response.data.message
                    : "Something went wrong while updating profile.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }
    console.log(getLaterFromAI)
    return (
        <div
            className="lg:max-h-[24rem] max-h-full xl:w-[40rem] lg:w-[35rem] md:w-[30rem] sm:w-[28rem] xs:max-w-full bg-dashboard-foreground overflow-y-auto p-6"
        >
            <h2
                className='
            md:text-2xl
            md:leading-6
            text-lg
            font-semibold
            '
            >
                Describe Your Cover Letter
            </h2>
            <p className='md:text-sm font-light text-muted-foreground'>Make your first impression count with a strong, tailored message, and the AI assistant will suggest cover letter.</p>
            <Label className='block font-extralight text-sm text-muted-foreground my-2'>Cover Letter</Label>
            <div className='relative '>
                <textarea
                    ref={textRef}
                    className="w-full h-40 p-2 border border-gray-300 rounded-md outline-none focus:ring-0 focus-visible:outline-none"
                    placeholder="Write your cover letter here..."
                />
                {/* <div className='absolute bottom-4 right-2'>
                    <StarButton>
                        {loading ? <div className='min-w-32 min-h-8 justify-center items-center flex gap-2 bg-black dark:bg-primary/15 rounded-full'>
                            <Loader2 className="w-6 h-6 stroke-white animate-spin" />
                        </div> :
                            <p onClick={() => !loading && getLaterFromAI()} className="bg-black rounded-full overflow-hidden px-4 py-1 text-white font-light flex justify-center items-center gap-2">
                                <AiIcon className="w-6 h-6" />
                                Suggest
                            </p>}
                    </StarButton>
                </div> */}
            </div>
            <div className='flex justify-start items-center gap-4 flex-wrap'>
                <BlackYellowStyleButton
                    title={loading ?"Submitting...":"Confirm & Submit"}
                    disabled={loading}
                    customStyles={
                        {
                            button: {
                                padding: "0.01rem 2rem"
                            }
                        }
                    }
                    onClick={onSave}
                />
                <WhiteStyleButton
                    title="Cancel"
                    onClick={() => closeModal(keyIs)}
                    customStyles={
                        {
                            button: {
                                padding: "0.01rem 2rem"
                            }
                        }
                    }
                />
            </div>
        </div>
    )
}
