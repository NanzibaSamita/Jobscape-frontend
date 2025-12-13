"use client"

import { ArrowLeft, Mail, Phone, Calendar, Loader } from "lucide-react"
import { Button } from "@/components/ui/button";
import ScreeningAnswers from "./screening-answer";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/axios/axios";
import { toast } from "react-toastify";
import { maskName } from "./[job_id]/applicant-card";
import CoverLetterSection from "./cover-letter-section";
import { useUI } from "@/contexts/ui-context";
import BlindCVTabs from "./BlindCv";
import { extractAIResponseFromText } from "@/lib/utils";

type Applicant = {
    id: string;
    name: string;
    email: string;
    phone: string;
    appliedDate: string; // ISO date string (e.g. "2024-01-15")
    position: string;
}

type ApplicationDetails = {
    applicant: Applicant;
    coverLetter: string;
    total_mark: number;
    cv_mark?: number;
    screeningAnswers: { question: string; answer: string, options: string[] | null | undefined, type: string }[];
}

interface ApplicantDetailsPageProps {
    applicantId: string,
    job_id: string,
    processed: boolean
    changeProcessed: (status: number, id: number | string) => void
}

export interface CVData {
    roles?: Array<{
        title?: string
        achievements?: string[]
    }>
    skills?: {
        general?: string[]
        technical?: string[]
    }
    tools?: string[]
    products?: ({
        name?: string
        description?: string
    } | string)[]
};







const GET_SCREENING_ANSWERS_API_ENDPOINT = "/api/v1/screening-test-answers-show";
export default function ApplicantModal({ applicantId, job_id, processed, changeProcessed }: ApplicantDetailsPageProps) {// In real app, fetch by ID
    const [isProcessed, setIsProcessed] = useState<boolean>(processed);
    const { closeModal } = useUI()
    const wrapperRef = useRef<HTMLDivElement>(null); // Add this
    const [dataLoad, setDataLoad] = useState(false);
    const [cvData, setCvData] = useState<CVData | null>(null);
    const [cvPdfUrl, setCvPdfUrl] = useState<string>("");
    const [applicantData, setApplicantData] = useState<ApplicationDetails>({
        applicant: {
            id: "",
            name: "",
            email: "",
            phone: "",
            appliedDate: "",
            position: ""
        },
        coverLetter: "",
        total_mark: 0,
        screeningAnswers: []
    });
    const { applicant, coverLetter, screeningAnswers, total_mark, cv_mark = 0 } = applicantData


    const getApplicantDetails = async () => {
        setDataLoad(true);
        api.get(`${GET_SCREENING_ANSWERS_API_ENDPOINT}?job_post_id=${job_id}&applicant_id=${applicantId}`)
            .then(res => {
                const { applicant_info, answer, total_mark, cv_mark } = res.data.data;
                setApplicantData({
                    applicant: {
                        id: applicantId,
                        name: applicant_info.full_name,
                        email: applicant_info.email,
                        phone: applicant_info.user_mobile,
                        appliedDate: applicant_info.apply_date,
                        position: applicant_info.job_title,
                    },
                    total_mark: total_mark,
                    coverLetter: applicant_info.cover_letter,
                    cv_mark: Number(cv_mark),
                    screeningAnswers: answer.map(({ questions, question_type, applicant_answer, option_one, option_two, option_three, option_four, right_answer }: {
                        questions: string,
                        question_type: string,
                        applicant_answer: string,
                        option_one?: string,
                        option_two?: string,
                        option_three?: string,
                        option_four?: string
                        right_answer?: string
                    }) => {
                        const options = [option_one, option_two, option_three, option_four].filter(Boolean);
                        return ({
                            question: questions,
                            answer: applicant_answer ? JSON.parse(applicant_answer)?.answer : "",
                            options: options,
                            type: question_type,
                            right_answer: right_answer ? right_answer : ""
                        })
                    })
                });
            })
            .catch((er) => {
                console.log(er);
            })
            .finally(() => {
                setDataLoad(false)
            })
    }

    async function handelAction(status: number) {
        await api.post("/api/v1/application-status-update", {
            job_post_id: job_id,
            applicant_id: applicantId,
            status: status,
        }).then(() => {
            toast.success("Application status updated successfully");
            changeProcessed(status, applicantId);
            setIsProcessed(true);
        })
            .catch((error) => {
                console.error("Update failed:", error);
                const msg =
                    error?.response?.data?.message ||
                    "Something went wrong.";
                toast.error(msg);
            })
            .finally(() => {
            });
    }




    const getFilePath = () => {
        api.get(`api/v1/cv/pdf-show?user_id=${applicantId}`)
            .then((res) => {
                // console.log(res.data)
                setCvPdfUrl(res.data.data?.cv_pdf_url || "");
                // console.log(extractAIResponseFromText(res.data.data?.blind_cv).blind_cv)
                setCvData(extractAIResponseFromText(res.data.data?.blind_cv).blind_cv);
            })
            .catch((er) => {
                console.log(er)
                // toast.error(er?.response?.data?.message ?? "Error fetching PDF file");
            });
    }


    useEffect(() => {
        getApplicantDetails();
        getFilePath();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicantId, job_id]);

    // ⬇️ Detect outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                closeModal("view-cv");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeModal]);

    if (dataLoad) {
        return <div className="">
            <Loader className="animate-spin" />
        </div>
    }
    return (
        <div className="w-[100vw] max-w-screen-xl bg-background" ref={wrapperRef}>
            <div className="py-8 md:px-8 px-2">
                <div className=" mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" className="mb-4 -ml-4" onClick={() => closeModal("view-cv")}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Applicants
                        </Button>
                        <div className="bg-card border border-border rounded-lg p-6">
                            <div className="flex items-start justify-between flex-wrap md:flex-nowrap space-y-2">
                                <div>
                                    <h1 className="text-2xl font-bold text-card-foreground mb-2">{maskName(applicant.name)}</h1>
                                    <p className="text-lg text-muted-foreground mb-4">{applicant.position}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {maskName(applicant.email)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {maskName(applicant.phone)}
                                        </div>
                                        {/* <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {maskName(applicant.location)}
                                        </div> */}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Applied {new Date(applicant.appliedDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {!isProcessed && <div className="flex gap-2">
                                    <Button onClick={() => handelAction(3)} variant="outline">Reject</Button>
                                    <Button onClick={() => handelAction(1)} >Shortlist</Button>
                                </div>}
                            </div>
                        </div>
                    </div>

                    {/* Cover Letter Section */}
                    <CoverLetterSection coverLetter={coverLetter} />

                    {/* Screening Answers Section */}
                    <ScreeningAnswers score={total_mark} answers={screeningAnswers} cv_mark={cv_mark} />

                    <BlindCVTabs cvData={cvData} cv_pdf_url={cvPdfUrl} />
                </div>
            </div>
        </div>
    )
}
