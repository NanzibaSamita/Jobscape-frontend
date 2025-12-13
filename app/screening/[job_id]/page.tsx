"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import QuestionCard from "./QuestionCard"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import BlackYellowStyleButton from "@/components/custom-UI/Buttons/BlackYellowStyleButton"
import { useUI } from "@/contexts/ui-context"
import { useParams } from "next/navigation"
import { api } from "@/lib/axios/axios"
import { Card } from "@/components/ui/card"
import { Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import CompleteScreening from "./CompleteScreening"
import { toast } from "react-toastify"

export type ScreeningTestQuestion = {
    id: number
    job_post_id: number
    screening_test_timer_id: number
    questions: string
    question_type: string
    option_one: string | null
    option_two: string | null
    option_three: string | null
    option_four: string | null
    right_answer: string | null
    created_at: string
    updated_at: string
}

type ScreeningTestData = {
    timer_seconds: number
    questions: ScreeningTestQuestion[]
    screening_test_started_at: string | null
    screening_test_ended_at: string | null
}


function formatAnswers(
    formValues: Record<number, string | string[]>,
    questions: ScreeningTestQuestion[]
) {
    return Object.entries(formValues).map(([id, answer]) => {
        const question = questions.find((q) => q.id === Number(id))
        if (!question) return null

        const { option_one, option_two, option_three, option_four } = question

        const optionMap: Record<string, string> = {
            option_one: option_one ?? "",
            option_two: option_two ?? "",
            option_three: option_three ?? "",
            option_four: option_four ?? "",
        }

        // Reverse lookup: "React" => "option_one"
        const getOptionKey = (value: string) => {
            return Object.entries(optionMap).find(([, label]) => label === value)?.[0]
        }

        let formattedAnswer = ""

        if (question.question_type === "text") {
            formattedAnswer = typeof answer === "string" ? answer : ""
        } else if (question.question_type === "multiple-choice") {
            const key = typeof answer === "string" ? getOptionKey(answer) : ""
            formattedAnswer = key || ""
        } else if (question.question_type === "multi-select") {
            const keys =
                Array.isArray(answer) && answer.length > 0
                    ? answer.map((val) => getOptionKey(val)).filter(Boolean)
                    : []
            formattedAnswer = keys.join(",")
        }

        return {
            screening_test_question_id: Number(id),
            qa_data: {
                answer: formattedAnswer,
            },
        }
    }).filter(Boolean)
}

export default function Page() {
    const params = useParams()
    const jobId = params?.job_id
    const [formData, setFormData] = useState<{ [key: number]: string | string[] }>({})
    const [loading, setLoading] = useState(false)
    const [testData, setTestData] = useState<ScreeningTestData | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [isTestStarted, setIsTestStarted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { openModal, closeModal } = useUI()
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number | null>(null)

    const handleAnswerChange = (questionId: number, value: string | string[]) => {
        setFormData((prev) => ({
            ...prev,
            [questionId]: value,
        }))

        // Save to localStorage for persistence
        const savedData = localStorage.getItem(`screening_test_${jobId}`)
        const currentData = savedData ? JSON.parse(savedData) : {}
        currentData.formData = { ...currentData.formData, [questionId]: value }
        localStorage.setItem(`screening_test_${jobId}`, JSON.stringify(currentData))
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    const handleSubmit = useCallback(async ({ staticQuestion, interval }: { staticQuestion?: ScreeningTestQuestion[], interval: NodeJS.Timeout | null }) => {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            // Clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            let rawData = {};
            const savedData = localStorage.getItem(`screening_test_${jobId}`)
            const parsedData = JSON.parse(savedData ?? '{}');
            if (parsedData.formData) {
                rawData = parsedData.formData;
            }

            // Format answers according to API requirements
            const formattedAnswers = formatAnswers(rawData, (staticQuestion ?? testData?.questions) || []);

            // Submit answers to API
            const response = await api.post(`/api/v1/screening-answer-store`, {
                job_post_id: Number.parseInt(jobId as string),
                answers: formattedAnswers,
            })

            if (response.status === 200) {
                // Clear localStorage
                localStorage.removeItem(`screening_test_${jobId}`)
                clearInterval(interval ?? '')
                // Show completion modal
                openModal("submit-screening", <CompleteScreening keyIs={"submit-screening"} closeModal={closeModal} />)
            }
        } catch (error) {
            console.error("Error submitting test:", error)
            // Handle error - maybe show error message
        } finally {
            setIsSubmitting(false)
        }
    }, [formData, jobId, isSubmitting, openModal, closeModal])

    const startTimer = useCallback(() => {
        if (!testData) return
        const startTime = Date.now()
        startTimeRef.current = startTime

        // Save start time to localStorage
        const savedData = localStorage.getItem(`screening_test_${jobId}`) || "{}"
        const currentData = JSON.parse(savedData)
        currentData.startTime = startTime
        currentData.totalTime = testData.timer_seconds
        localStorage.setItem(`screening_test_${jobId}`, JSON.stringify(currentData));

        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = Math.max(0, testData.timer_seconds - elapsed)

            setTimeRemaining(remaining)
            console.log(`Time remaining: ${remaining} seconds`)
            if (remaining <= 0) {
                // Auto-submit when time is up
                handleSubmit({
                    staticQuestion: testData.questions,
                    interval: timerRef.current,
                });
            }
        }, 1000);
    }, [testData, jobId, handleSubmit])

    const startTimerReload = useCallback((respData: ScreeningTestData) => {
        if (!respData) return
        const startTime = new Date(respData.screening_test_started_at ?? "").getTime()
        startTimeRef.current = startTime

        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = Math.max(0, respData.timer_seconds - elapsed)

            setTimeRemaining(remaining)
            console.log(`Time remaining: ${remaining} seconds`)
            // if (remaining <= 0) {
            //     // Auto-submit when time is up
            //     handleSubmit({
            //         staticQuestion: respData.questions,
            //         interval: timerRef.current,
            //     });
            // }
        }, 1000);
    }, [jobId, handleSubmit])

    const startTest = async () => {
        if (!testData) return

        setLoading(true)

        try {
            // Call API to mark test as started
            const response = await api.post(`/api/v1/screening-test-start-time`, {
                job_post_id: jobId,
                started_at: new Date().toISOString(),
            })

            if (response.status === 200) {
                setIsTestStarted(true)
                setTimeRemaining(testData.timer_seconds)
                startTimer()
            }
        } catch (error) {
            console.error("Error starting test:", error);
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || "Failed to start test. Please try again.");
        } finally {
            setLoading(false)
        }
    }

    const fetchQuestions = async () => {
        try {
            const response = await api.get(`/api/v1/screening-question-show?job_post_id=${jobId}`)

            if (response.status === 200) {
                const data: ScreeningTestData = response.data.data
                setTestData(data)

                // Check if test was already started
                const isStarted = data.screening_test_started_at !== null;
                const isEnded = data.screening_test_ended_at !== null;
                setIsTestStarted(isStarted)

                if (isStarted && !isEnded) {
                    // Check localStorage for existing session
                    const savedData = localStorage.getItem(`screening_test_${jobId}`)

                    if (savedData) {
                        const parsedData = JSON.parse(savedData)
                        // Restore form data
                        if (parsedData.formData) {
                            setFormData(parsedData.formData)
                        }

                        // Calculate remaining time
                        if (parsedData.startTime && parsedData.totalTime) {
                            const elapsed = Math.floor((Date.now() - parsedData.startTime) / 1000)
                            const remaining = Math.max(0, parsedData.totalTime - elapsed)

                            if (remaining > 0) {
                                // setTimeRemaining(remaining)
                                // startTimeRef.current = parsedData.startTime

                                // // Resume timer
                                // timerRef.current = setInterval(() => {
                                //     const currentElapsed = Math.floor((Date.now() - parsedData.startTime) / 1000)
                                //     const currentRemaining = Math.max(0, parsedData.totalTime - currentElapsed)

                                //     setTimeRemaining(currentRemaining)

                                //     if (currentRemaining <= 0) {
                                //         handleSubmit({
                                //             staticQuestion: data.questions,
                                //             interval: timerRef.current,
                                //         })
                                //     }
                                // }, 1000)
                                startTimerReload(data);
                                setTimeout(() => {
                                    handleSubmit({
                                        staticQuestion: data.questions,
                                        interval: timerRef.current,
                                    })
                                }, remaining * 1000);
                                console.log(remaining, "remaining time from localStorage");
                            } else {
                                // if (testData && (!testData?.screening_test_ended_at)) {
                                handleSubmit({
                                    staticQuestion: data.questions,
                                    interval: timerRef.current,
                                })
                                // }
                            }
                        }
                    } else {
                        // Started but no localStorage data, calculate from server time
                        const startTime = new Date(data.screening_test_started_at ?? "").getTime()
                        const elapsed = Math.floor((Date.now() - startTime) / 1000)
                        const remaining = Math.max(0, data.timer_seconds - elapsed)

                        if (remaining > 0) {
                            setTimeRemaining(remaining)
                            startTimer()
                        } else {
                            // if (testData && (!testData?.screening_test_ended_at)) {
                            handleSubmit({
                                staticQuestion: data.questions,
                                interval: timerRef.current,
                            })
                            // }
                        }
                    }
                } else if (isEnded) {
                    // Test already ended, no need to start timer
                    setTimeRemaining(0)
                    setIsTestStarted(false)
                } else {
                    setTimeRemaining(data.timer_seconds)
                }
            }
        } catch (error) {
            console.error("Error fetching questions:", error)
        }
    }

    useEffect(() => {
        if (jobId) {
            setLoading(true)
            fetchQuestions().finally(() => setLoading(false))
        }

        // Cleanup timer on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [jobId])


    if (loading) {
        return (
            <DashboardLayout>
                <div className="w-full flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading screening test...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!testData) {
        return (
            <DashboardLayout>
                <div className="w-full flex items-center justify-center h-64">
                    <p>Failed to load screening test. Please try again.</p>
                </div>
            </DashboardLayout>
        )
    }
    if (testData.screening_test_started_at && testData.screening_test_ended_at) {
        return (
            <DashboardLayout>
                <div className="w-full flex items-center justify-center h-64">
                    <Card className="p-6 text-center">
                        <h2 className="text-xl font-semibold mb-2">Test Already Submitted</h2>
                        <p className="text-muted-foreground">You have already completed and submitted this screening test.</p>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="w-full flex flex-col h-full space-y-4 items-start justify-start overflow-y-auto">
                <div className="flex items-center justify-between w-full">
                    <h1 className="text-2xl font-medium">Screening Questions</h1>

                    {isTestStarted && (
                        <Card className="p-3 border border-slate-300/50 rounded-xl bg-dashboard-foreground">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span
                                    className={`font-mono text-lg font-semibold ${timeRemaining <= 60 ? "text-red-500" : timeRemaining <= 300 ? "text-yellow-500" : "text-green-500"
                                        }`}
                                >
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        </Card>
                    )}
                </div>

                {!isTestStarted ? (
                    <div className="w-full max-w-2xl mx-auto">
                        <Card className="p-8 border border-slate-300/50 rounded-xl bg-dashboard-foreground text-center">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Ready to Start Your Screening Test?</h2>
                                    <p className="text-muted-foreground">
                                        You have <strong>{formatTime(testData.timer_seconds)}</strong> to complete{" "}
                                        {testData.questions.length} questions.
                                    </p>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Instructions:</h3>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 text-left">
                                        <li>• Once started, the timer cannot be paused</li>
                                        <li>• Your progress will be saved automatically</li>
                                        <li>• The test will auto-submit when time expires</li>
                                        <li>• Make sure you have a stable internet connection</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={startTest}
                                    disabled={loading}
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                                >
                                    <Play className="h-5 w-5 mr-2" />
                                    {loading ? "Starting..." : "Start Test"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="h-full w-full max-w-3xl overflow-y-auto">
                        <div className="space-y-8">
                            {testData.questions.map((question, ind) => (
                                <QuestionCard
                                    index={ind + 1}
                                    key={question.id}
                                    question={question}
                                    value={formData[question.id] || ""}
                                    onChange={(value) => handleAnswerChange(question.id, value)}
                                />
                            ))}
                        </div>

                        <div className="mt-8 pb-8">
                            <BlackYellowStyleButton
                                title={isSubmitting ? "Submitting..." : "Confirm & Submit"}
                                customStyles={{
                                    button: {
                                        padding: "0.01rem 2rem",
                                    },
                                }}
                                onClick={() => handleSubmit({
                                    staticQuestion: testData.questions,
                                    interval: timerRef.current,
                                })}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}