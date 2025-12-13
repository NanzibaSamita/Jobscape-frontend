import { Check } from "lucide-react"

type QuestionAndAnswer = { question: string; answer: string, options: string[] | null | undefined, type: string, right_answer?: string };

interface ScreeningAnswersProps {
    answers: QuestionAndAnswer[],
    score?: number // Optional score prop, default is 0
    cv_mark: number 
}

const answerMapping: {
    [key: string]: string
} = {
    "1": "option_one",
    "2": "option_two",
    "3": "option_three",
    "4": "option_four",
}
export default function ScreeningAnswers({ answers, score = 0, cv_mark }: ScreeningAnswersProps) {

    return (
        <div>
            <div className="flex items-start justify-between flex-wrap">
                <h2 className="text-xl font-semibold text-foreground mb-4">Screening Questions</h2>
                <section className="flex gap-3">
                    <h2 className="text-xl font-semibold text-foreground mb-4 border rounded-lg px-4">Score gained: {score}</h2>
                    <h2 className="text-xl font-semibold text-foreground mb-4 border rounded-lg px-4">CV Score: {cv_mark}</h2>
                </section>
            </div>
            <div className="space-y-4">
                {answers.map((item, index) => (
                    < div key={index} className="bg-card border border-border rounded-lg p-6 shadow-sm" >
                        <div className="mb-3">
                            <h3 className="font-semibold text-card-foreground text-base leading-relaxed">{item.question}</h3>
                        </div>
                        {
                            item.type === "text" ? (<div className="text-muted-foreground leading-relaxed ">{item.answer}</div>) : (
                                <div className="bg-dashboard border border-border rounded-lg p-4 space-y-2">
                                    {
                                        item.options && item.options.length > 0 ? (
                                            item.options.map((option, idx) => (
                                                <div key={idx} className={`border flex justify-between items-center p-2 gap-2 rounded-lg border-primary/30 ${item.answer.includes(answerMapping[String(idx + 1)]) ? "bg-primary/20" : "text-muted-foreground"}`}>
                                                    <span className="text-sm">{option}</span>
                                                    {item?.right_answer?.includes(answerMapping[String(idx + 1)]) && <Check />}
                                                </div>
                                            ))
                                        ) : ""
                                    }
                                </div>
                            )
                        }
                    </div>
                ))}
            </div>
        </div >
    )
}
