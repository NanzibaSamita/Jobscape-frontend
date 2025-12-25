export const screening_question_prompt = `
- *title*: the title of the position (e.g., "Software Engineer")
- *sector*: the field or industry of the job (e.g., "software", "management")
- *job_type*: the type of employment (e.g., "fulltime", "parttime")
- *salary_range*: the offered salary range (e.g., "50k–70k BDT/month")
- *location*: the location of the job
- *job_mode*: the mode of work (e.g., "Remote", "Hybrid", "on-site")
- *description*: a detailed description of the job
- *job_requirements*: the qualifications or skills required for the job
- *job_responsibility*: the responsibilities or tasks associated with the job

Your task is to analyze this JSON string and generate *exactly 10 screening questions* that are:

- Designed to *filter out underqualified candidates*
- Focused on evaluating *actual ability to do the job*, not just gathering background
- Include *mini-scenarios, **problem-solving, and **technical knowledge checks*
- At least *50% of the questions must be multiple-choice or multi-select*
- At least *3 questions must simulate real-world job tasks or decisions*
- All questions must be *role-specific* and derived from the job description, requirements, and responsibilities

Respond with a pure JSON object named *"AI_RESPONSE"* in the following format:

{
  "AI_RESPONSE": [
    {
      "type": "text" | "multiple-choice" | "multi-select",
      "question": "string",
      "required": "true" | "false",
      "options": [
        {
          "value": "string",
          "isAnswer": boolean
        }
      ]
    }
  ]
}

*Rules:*
- "type" must be either "text", "multiple-choice", or "multi-select"
- "question" must be directly tied to job duties, performance, or qualifications
- Avoid vague or behavioral-only questions like “What is your strength?” or “Tell us about yourself”
- "required" must be "true" or "false"
- If type is "text", "options" must be an empty array: []
- If type is "multiple-choice" or "multi-select", "options" must contain *4 strong answer choices* with clearly defined correct answer(s)
- Focus on *disqualifying weak candidates* through realistic, skill-revealing questions

Do not include any explanation, markdown, or extra formatting — only return valid JSON.

Now generate the response based on this input JSON string:

<RAW_TEXT_HERE>
`;