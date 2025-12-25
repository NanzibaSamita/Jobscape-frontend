import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { marked } from "marked";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function uniqueID() {
  const timestamp = Date.now().toString(36).slice(-2); // last 2 chars of base-36 timestamp
  const randomNum = Math.random().toString(36).substr(2, 4); // 4 random chars
  return `${timestamp}${randomNum}`; // no dash, just 6 chars total
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractAIResponseFromText(content: string): any {
  try {
    // Remove Markdown code block formatting (e.g., ```json or ```)
    const cleaned = content
      .replace(/^```(json)?/gm, "")
      .replace(/```$/gm, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // If it's directly the object, return it
    if (parsed && typeof parsed === "object") {
      if ("AI_RESPONSE" in parsed) {
        return parsed.AI_RESPONSE;
      } else {
        return parsed;
      }
    }

    throw new Error("Parsed content is not a valid object.");
  } catch (err) {
    throw new Error("Failed to extract AI response: " + (err as Error).message);
  }

}
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/); // Split by any whitespace

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" "); // Combine the rest for multi-part last names

  return { firstName, lastName };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMaxRoleWeight(user: any) {
  if (!user?.roles?.length) return null;

  return Math.max(...user.roles.map((role: {
    name: string,
    role_weight: string,
    pivot: {
      model_type: string,
      model_id: number,
      role_id: number
    }
  }) => parseFloat(role.role_weight)));
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(',', '') // Remove the comma after the day
    .replace(' at', ' -'); // Replace " at" with " -"
}
export function getRelativeDateLabel(input: Date | string, nullable: boolean = false): string {
  if (!input && nullable) return 'N/A';
  const date = new Date(input);
  const today = new Date();
  const yesterday = new Date();

  // Normalize time to midnight for comparison
  today.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate.getTime() === today.getTime()) return "Today";
  if (inputDate.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }); // e.g., "July 06, 2025"
}
export function markdownToHtml(markdown: string): Promise<string> {
  return Promise.resolve(marked.parse(markdown));
}


type InputOption = {
  id: string;
  value: string;
  isAnswer?: boolean;
};

type InputQuestion = {
  type: string;
  question: string;
  required: boolean;
  options: InputOption[];
};

export type OutputQuestion = {
  question_type: string;
  questions: string;
  option_one?: string;
  option_two?: string;
  option_three?: string;
  option_four?: string;
  right_answer?: string;
};
type OutputOption = {
  id: string;
  value: string;
  isAnswer: boolean;
};

export function transformQuestionsToPost(input: InputQuestion[]): OutputQuestion[] {
  return input.map((q) => {
    const output: OutputQuestion = {
      question_type: q.type,
      questions: q.question,
      right_answer: undefined
    };

    // Handle options if present
    if (q.options && q.options.length > 0) {
      const optionKeys = ['option_one', 'option_two', 'option_three', 'option_four'] as const;

      q.options.slice(0, 4).forEach((opt, i) => {
        output[optionKeys[i]] = opt.value;
      });

      const answerIndexes = q.options
        .map((opt, i) => (opt.isAnswer ? optionKeys[i] : null))
        .filter(Boolean) as string[];

      output.right_answer = q.type === "multi-select"
        ? answerIndexes.join(',')
        : answerIndexes[0] || '';
    } else if (q.type === 'text') {
      // output.right_answer = 'It is the practice of hiding internal details.'; // Default placeholder
    }
    return output;
  });
};

export function transformQuestionData(input: OutputQuestion[]): InputQuestion[] {
  return input.map((item) => {
    const base = {
      question: item.questions,
      required: true,
    };

    const options: OutputOption[] = [];
    const optionKeys = ["option_one", "option_two", "option_three", "option_four"];

    for (let i = 0; i < optionKeys.length; i++) {
      const key = optionKeys[i] as keyof OutputQuestion;
      const value = item[key];
      if (value) {
        const isAnswer =
          item.question_type === "multi-select"
            ? item.right_answer?.split(",").includes(key)
            : item.right_answer === key;

        options.push({
          id: crypto.randomUUID(),
          value,
          isAnswer: isAnswer ?? false,
        });
      }
    }
    return {
      ...base,
      type: item.question_type,
      options,
    };
  });
}

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  // Allowed tags (very strict!)
  const allowedTags = ['p', 'strong', 'b', 'i', 'em', 'u', 'ul', 'ol', 'li', 'br'];

  // Remove script/style and dangerous tags completely
  input = input.replace(/<(script|style|iframe|object|embed|link)[^>]*>.*?<\/\1>/gi, '');

  // Remove event handler attributes like onclick, onerror, etc.
  input = input.replace(/ on\w+="[^"]*"/gi, '');
  input = input.replace(/ on\w+='[^']*'/gi, '');

  // Replace all tags with their sanitized versions
  return input.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag) => {
    return allowedTags.includes(tag.toLowerCase()) ? match : '';
  });
}