"use client"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ScreeningTestQuestion } from "./page"

interface QuestionCardProps {
    question: ScreeningTestQuestion
    value: string | string[]
    index: number
    onChange: (value: string | string[], key?: string) => void
}

export default function QuestionCard({ question, value, onChange, index }: QuestionCardProps) {
    const options = [
        question.option_one,
        question.option_two,
        question.option_three,
        question.option_four,
    ].filter((opt): opt is string => opt !== null)

    const getOptionKey = (option: string) => {
        if (option === question.option_one) return "option_one"
        if (option === question.option_two) return "option_two"
        if (option === question.option_three) return "option_three"
        if (option === question.option_four) return "option_four"
        return ""
    }

    return (
        <div className="space-y-2 rounded-xl bg-primary/5 p-4">
            <Card className="p-3 border border-slate-300/50 rounded-xl bg-dashboard-foreground">
                <p className="font-medium">
                    {index}. {question.questions}
                </p>
            </Card>

            <div className="space-y-2">
                <Label className="text-muted-foreground font-medium">
                    Write Your Answer {/* You can conditionally show * if required info is added later */}
                </Label>

                {question.question_type === "text" && (
                    <Textarea
                        placeholder="Write Your Answer Here"
                        value={typeof value === "string" ? value : ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="min-h-[100px] bg-background border-slate-300/50 rounded-lg resize-none"
                    />
                )}

                {question.question_type === "multiple-choice" && options.length > 0 && (
                    <RadioGroup
                        value={Array.isArray(value) ? value[0] ?? "" : value}
                        onValueChange={(val) => {
                            const key = getOptionKey(val)
                            onChange(val, key)
                        }}
                        className="grid grid-cols-2 gap-4 mt-4"
                    >
                        {options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value={option}
                                    id={`${question.id}-${idx}`}
                                    className="data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                                />
                                <Label
                                    htmlFor={`${question.id}-${idx}`}
                                    className="font-medium cursor-pointer flex-1 p-3 border border-slate-300/50 rounded-full text-center hover:bg-gray-50 hover:dark:bg-slate-900/40"
                                >
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}

                {question.question_type === "multi-select" && options.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {options.map((option, idx) => {
                            const checked = Array.isArray(value) && value.includes(option)
                            return (
                                <div key={idx} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`${question.id}-${idx}`}
                                        checked={checked}
                                        onCheckedChange={(checked) => {
                                            const currentValues = Array.isArray(value) ? value : []
                                            const key = getOptionKey(option)
                                            if (checked) {
                                                onChange([...currentValues, option], key)
                                            } else {
                                                onChange(currentValues.filter((v) => v !== option), key)
                                            }
                                        }}
                                        className="data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                                    />
                                    <Label
                                        htmlFor={`${question.id}-${idx}`}
                                        className="font-medium cursor-pointer flex-1 p-3 border border-slate-300/50 rounded-lg hover:bg-gray-50 hover:dark:bg-slate-900/40"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
