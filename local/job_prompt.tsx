export const job_prompt = `
- **title**: the title of the position (e.g., "Software Engineer")
- **sector**: the field or industry of the job (e.g., "software", "management")
- **job_type**: the type of employment (e.g., "fulltime", "parttime")
- **salary_range**: the offered salary range (e.g., "50k–70k BDT/month")
- **location**: the location of the job
- **job_mode**: the mode of work (e.g., "Remote", "Hybrid", "on-site")

Your task is to analyze this JSON string and return a professionally written:

- **description**
- **job_requirements**
- **job_responsibility**
- **job_benefits**
Important: Please provide the output in rich text format (HTML or similar), including paragraphs, lists, and other formatting elements to enhance readability and presentation.

Respond with a pure JSON object named **"AI_RESPONSE"** in the following format:

{
  "description": "string",
  "job_requirements": "string",
  "job_responsibility": "string"
  "job_benefits": "string"
}

**Formatting rules:**
- Your output must be JSON only (no markdown, no explanation, no extra text).
- In the **"requirements"** and **"responsibilities"** fields, start each numbered item on a **new line**, like:  
  "'1. First item.\n2. Second item.\n3. Third item.'"

If any detail seems vague or missing, generate realistic and relevant content based on the provided values.

Now generate the response based on this input JSON string:

<RAW_TEXT_HERE>
`;