export interface JobSuggestion {
    id: string
    jobTitle: string
    company: string
    description: string
    requirements: string[]
    salary: string
    location: string
    status: "pending" | "accepted" | "rejected"
    receivedDate: string
    hrContact: {
        name: string
        email: string
        avatar?: string
    }
}
