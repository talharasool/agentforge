const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

interface GroqMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

async function groqChat(
  messages: GroqMessage[],
  opts: { temperature?: number; max_tokens?: number; json?: boolean } = {}
): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.max_tokens ?? 4096,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export interface PromptAnalysis {
  score: number;
  suggestions: { label: string; question: string }[];
  strengths: string[];
}

export interface GeneratedAgent {
  claudeMd: string;
  systemPrompt: string;
  toolsList: string;
  exampleUsage: string;
}

export async function analyzePrompt(
  description: string
): Promise<PromptAnalysis> {
  const text = await groqChat(
    [
      {
        role: "user",
        content: `You are a prompt engineering expert. Analyze this agent description and return a JSON assessment.

Description: "${description}"

Return ONLY valid JSON (no markdown fences, no extra text) with this exact structure:
{
  "score": <number 0-100 representing completeness>,
  "suggestions": [
    { "label": "<short chip label like 'Add output format'>", "question": "<focused follow-up question>" }
  ],
  "strengths": ["<what's good about this description>"]
}

Scoring criteria:
- Has clear goal/purpose: 0-20 points
- Specifies target context (language, framework, domain): 0-15 points
- Defines expected output format: 0-15 points
- Mentions error handling or edge cases: 0-15 points
- Includes constraints or tone: 0-10 points
- Provides examples: 0-15 points
- Mentions tools or capabilities needed: 0-10 points

Only suggest what's genuinely missing. If the description is thorough, give fewer suggestions.`,
      },
    ],
    { temperature: 0.3, json: true }
  );

  try {
    return JSON.parse(text) as PromptAnalysis;
  } catch {
    return { score: 0, suggestions: [], strengths: [] };
  }
}

export async function improvePrompt(description: string): Promise<string> {
  const text = await groqChat(
    [
      {
        role: "user",
        content: `You are a prompt engineering expert. Take this agent description and rewrite it to be more complete and effective.

Original description:
"${description}"

Improve it by:
- Making the goal clearer and more specific
- Adding output format details if missing
- Adding error handling behavior if missing
- Specifying tools or capabilities needed if missing
- Adding constraints or tone guidance if missing
- Including a brief example of expected input/output if missing
- Keeping the user's original intent intact

Return ONLY the improved description text. No JSON, no markdown fences, no explanations — just the improved description ready to paste into a text field.`,
      },
    ],
    { temperature: 0.4, max_tokens: 1024 }
  );

  return text || description;
}

export interface ExtractedBuilder {
  goal: string;
  tools: string[];
  tone: "strict" | "flexible";
  outputFormat: "json" | "markdown" | "plain";
  errorHandling: string;
  context: string;
  exampleInput: string;
  exampleOutput: string;
}

export async function extractBuilderData(
  description: string
): Promise<ExtractedBuilder> {
  const text = await groqChat(
    [
      {
        role: "user",
        content: `You are an expert at understanding agent descriptions. Extract structured builder data from this description.

Description: "${description}"

Return JSON with this exact structure:
{
  "goal": "<the main goal/purpose of the agent — be specific and detailed>",
  "tools": [<array of tool IDs the agent needs from: "file-read", "file-write", "bash", "web-search", "git", "api-calls">],
  "tone": "<either 'strict' or 'flexible' based on the description>",
  "outputFormat": "<either 'json', 'markdown', or 'plain' based on the description>",
  "errorHandling": "<how the agent should handle errors and edge cases>",
  "context": "<relevant tech stack, codebase info, or conventions mentioned>",
  "exampleInput": "<a realistic example of what a user might ask this agent>",
  "exampleOutput": "<a brief example of what the agent would produce>"
}

Infer reasonable defaults for any fields not explicitly mentioned in the description. Be thorough and specific.`,
      },
    ],
    { temperature: 0.3, json: true }
  );

  try {
    const parsed = JSON.parse(text) as ExtractedBuilder;
    const validTools = ["file-read", "file-write", "bash", "web-search", "git", "api-calls"];
    parsed.tools = parsed.tools.filter((t) => validTools.includes(t));
    if (parsed.tone !== "strict" && parsed.tone !== "flexible") parsed.tone = "flexible";
    if (!["json", "markdown", "plain"].includes(parsed.outputFormat)) parsed.outputFormat = "markdown";
    return parsed;
  } catch {
    return {
      goal: description,
      tools: [],
      tone: "flexible",
      outputFormat: "markdown",
      errorHandling: "",
      context: "",
      exampleInput: "",
      exampleOutput: "",
    };
  }
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  why: string;
  options: { label: string; description: string; visual?: string }[];
  allowCustom: boolean;
  multiSelect?: boolean;
}

export async function generateInterview(
  description: string
): Promise<InterviewQuestion[]> {
  const text = await groqChat(
    [
      {
        role: "user",
        content: `You are a senior software architect and agent design expert. A user wants to build an AI coding agent. Based on their description, generate smart, domain-specific interview questions that will help configure the perfect agent — even if the user is non-technical.

User's description: "${description}"

Analyze the domain (e.g. e-commerce, SaaS, mobile app, API, data pipeline, etc.) and generate 6-8 highly relevant questions. Each question should:
- Be specific to their domain and use case
- Have 3-4 predefined options with clear, jargon-free descriptions
- Include a "visual" field with an ASCII diagram or code example showing what the option looks like in practice
- Help determine technical decisions the agent needs to know about

Categories to cover (pick the most relevant ones):
- "Architecture" — design patterns, project structure, monolith vs microservices
- "Tech Stack" — framework, language, runtime, styling libraries
- "Backend" — API style, database, authentication, hosting
- "Frontend" — UI framework, styling approach, state management
- "DevOps" — deployment, CI/CD, containerization
- "Quality" — testing strategy, code standards, linting
- "Security" — auth method, data handling, API security
- "Features" — domain-specific features they'll likely need

IMPORTANT: Each option MUST include a "visual" field showing a concrete example. For architecture, show a folder structure or diagram. For tech stack, show a code snippet. For databases, show a schema example. This helps non-technical users understand what they're choosing.

Return JSON:
{
  "questions": [
    {
      "id": "<unique-id>",
      "category": "<category name>",
      "question": "<the question in plain English>",
      "why": "<one sentence explaining why this matters — helps non-technical users understand>",
      "options": [
        {
          "label": "<short label>",
          "description": "<2-3 sentence plain English explanation>",
          "visual": "<ASCII diagram, folder tree, or code snippet showing what this looks like. Use \\n for newlines. Example for Monolithic:\\n  src/\\n  ├── pages/\\n  ├── components/\\n  ├── api/\\n  └── database/\\n  (Everything in one project)"
        }
      ],
      "allowCustom": <true if user might have a specific answer not in options>,
      "multiSelect": <true if user should be able to pick MULTIPLE options — use for Security, Features, Quality, and any question where combining choices makes sense (e.g. "JWT + Social Login", "Unit Tests + Integration Tests + E2E Tests")>
    }
  ]
}

Example visual for architecture question:
- Monolithic: "src/\\n├── pages/\\n├── components/\\n├── api/\\n├── models/\\n└── utils/\\n\\nOne project, one deployment.\\nSimple to start, easy to manage."
- Microservices: "services/\\n├── user-service/\\n├── product-service/\\n├── order-service/\\n├── payment-service/\\n└── gateway/\\n\\nSeparate projects that talk via APIs.\\nScales independently."

Example visual for React vs Next.js:
- React SPA: "import { BrowserRouter } from 'react-router-dom'\\n// Client-side only\\n// Fast interactions, needs separate API"
- Next.js: "// app/page.tsx\\nexport default async function Page() {\\n  const data = await fetch('/api/products')\\n  return <ProductList data={data} />\\n}\\n// Server + Client, built-in API routes"

Make EVERY option beginner-friendly with clear descriptions AND visuals.`,
      },
    ],
    { temperature: 0.4, max_tokens: 4096, json: true }
  );

  try {
    const parsed = JSON.parse(text);
    return (parsed.questions ?? []) as InterviewQuestion[];
  } catch {
    return [];
  }
}

export async function buildFromInterview(params: {
  description: string;
  answers: Record<string, string>;
}): Promise<ExtractedBuilder> {
  const answersText = Object.entries(params.answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join("\n\n");

  const text = await groqChat(
    [
      {
        role: "user",
        content: `You are a senior software architect. Based on the user's project description and their answers to technical questions, generate a comprehensive agent configuration.

Project description: "${params.description}"

Interview answers:
${answersText}

Using ALL of this context, generate a detailed agent configuration. Be very specific and thorough — include the exact tech stack, patterns, conventions, and tools the agent should use based on their answers.

Return JSON:
{
  "goal": "<very detailed goal incorporating all the technical decisions from the interview>",
  "tools": [<array from: "file-read", "file-write", "bash", "web-search", "git", "api-calls">],
  "tone": "<'strict' or 'flexible'>",
  "outputFormat": "<'json', 'markdown', or 'plain'>",
  "errorHandling": "<detailed error handling strategy based on their tech stack and domain>",
  "context": "<comprehensive tech stack details, design patterns, project structure, conventions — everything the agent needs to know>",
  "exampleInput": "<realistic example task a user would give this agent>",
  "exampleOutput": "<realistic example of what the agent would produce>"
}`,
      },
    ],
    { temperature: 0.3, max_tokens: 4096, json: true }
  );

  try {
    const parsed = JSON.parse(text) as ExtractedBuilder;
    const validTools = ["file-read", "file-write", "bash", "web-search", "git", "api-calls"];
    parsed.tools = (Array.isArray(parsed.tools) ? parsed.tools : []).filter((t) => validTools.includes(t));
    if (parsed.tone !== "strict" && parsed.tone !== "flexible") parsed.tone = "flexible";
    if (!["json", "markdown", "plain"].includes(parsed.outputFormat)) parsed.outputFormat = "markdown";
    return parsed;
  } catch {
    return {
      goal: params.description,
      tools: [],
      tone: "flexible",
      outputFormat: "markdown",
      errorHandling: "",
      context: "",
      exampleInput: "",
      exampleOutput: "",
    };
  }
}

export async function generateAgent(params: {
  goal: string;
  tools: string[];
  tone: string;
  outputFormat: string;
  errorHandling: string;
  context: string;
  exampleInput: string;
  exampleOutput: string;
}): Promise<GeneratedAgent> {
  const text = await groqChat(
    [
      {
        role: "user",
        content: `You are a world-class software architect and Claude Code agent expert. Generate the most comprehensive, production-ready agent setup possible.

## Specifications
- **Goal:** ${params.goal}
- **Tools:** ${params.tools.join(", ")}
- **Tone:** ${params.tone}
- **Output Format:** ${params.outputFormat}
- **Error Handling:** ${params.errorHandling}
- **Context:** ${params.context}
- **Example Input:** ${params.exampleInput}
- **Example Output:** ${params.exampleOutput}

## Requirements for each section

### claudeMd (CLAUDE.md file)
This MUST be extremely detailed (at least 80-100 lines). Include ALL of these sections:
1. **Project Overview** — what this agent builds and its domain
2. **Tech Stack** — every technology with version numbers (e.g., "React 18", "Next.js 14", "Tailwind CSS 3.4", "TypeScript 5")
3. **Architecture** — design pattern, folder structure as a tree diagram, data flow
4. **Coding Conventions** — naming conventions, file naming, import order, component patterns
5. **Styling** — CSS approach (Tailwind classes, CSS modules, styled-components), theme variables, responsive breakpoints
6. **State Management** — what to use and when (React Context, Zustand, Redux, etc.)
7. **API Conventions** — REST/GraphQL patterns, endpoint naming, request/response format, error codes
8. **Database** — schema conventions, migration approach, query patterns
9. **Authentication** — auth flow, token handling, protected routes
10. **Testing** — testing framework, what to test, naming conventions, coverage expectations
11. **Error Handling** — error boundaries, API error handling, user-facing messages, logging
12. **Performance** — lazy loading, caching, image optimization, bundle size
13. **Git Conventions** — branch naming, commit message format, PR process
14. **Do's and Don'ts** — specific patterns to follow and anti-patterns to avoid

### systemPrompt
This MUST be very detailed (at least 40-50 lines). Include:
- Agent personality and expertise level
- Step-by-step workflow the agent should follow
- How to analyze requirements before coding
- Code quality standards specific to the tech stack
- How to structure responses
- When to ask for clarification vs. making decisions
- Tech-stack-specific best practices (e.g., if React: hooks rules, component composition, memo usage)

### toolsList
For each tool, provide:
- Tool name
- When to use it (specific scenarios)
- Example usage command
- Best practices for that tool

### exampleUsage
Provide 5-7 realistic, detailed examples showing:
- The exact command/prompt
- What the agent would do step-by-step
- Expected output format

IMPORTANT: Adapt everything to the specific tech stack. If it's React, include React-specific patterns (hooks, JSX, component lifecycle). If it's Swift/SwiftUI, include Swift patterns (protocols, property wrappers, view modifiers). If it's Python/Django, include Django patterns (models, views, serializers). Be specific to the exact technology, not generic.

Return JSON:
{
  "claudeMd": "<the complete CLAUDE.md content>",
  "systemPrompt": "<the detailed system prompt>",
  "toolsList": "<the comprehensive tools list>",
  "exampleUsage": "<the detailed usage examples>"
}`,
      },
    ],
    { temperature: 0.5, max_tokens: 8000, json: true }
  );

  try {
    return JSON.parse(text) as GeneratedAgent;
  } catch {
    return {
      claudeMd: "# Error\nFailed to parse generated agent configuration.",
      systemPrompt: "",
      toolsList: "",
      exampleUsage: "",
    };
  }
}
