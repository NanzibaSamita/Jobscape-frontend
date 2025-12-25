export interface Question {
    id: number
    type: string // "text" | "multiple-choice" | "radio"
    question: string
    required?: boolean
    options?: (string | null)[] | null | undefined
}