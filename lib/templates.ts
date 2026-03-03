export interface AgentTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  goal: string;
  tools: string[];
  tone: "strict" | "flexible";
  outputFormat: "json" | "markdown" | "plain";
  errorHandling: string;
  context: string;
  exampleInput: string;
  exampleOutput: string;
}

export const templates: AgentTemplate[] = [
  {
    id: "bug-fixer",
    name: "Bug Fixer",
    icon: "Bug",
    description: "Diagnoses and fixes bugs by analyzing error traces, logs, and code context.",
    goal: "Analyze bug reports, trace root causes through the codebase, and produce minimal, correct fixes with explanations.",
    tools: ["file-read", "file-write", "bash", "git"],
    tone: "strict",
    outputFormat: "markdown",
    errorHandling: "If a fix cannot be confidently determined, provide a diagnostic report with hypotheses ranked by likelihood instead of guessing.",
    context: "Full access to the project repository. Uses git blame and diff to understand recent changes that may have introduced the bug.",
    exampleInput: "TypeError: Cannot read properties of undefined (reading 'map') in UserList.tsx line 42",
    exampleOutput: "## Root Cause\nThe `users` prop is not initialized with a default value...\n\n## Fix\n```tsx\nconst users = props.users ?? [];\n```",
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    icon: "GitPullRequest",
    description: "Reviews pull requests and code changes with senior-engineer-level feedback.",
    goal: "Review code changes for correctness, performance, security, and adherence to team conventions. Provide actionable feedback.",
    tools: ["file-read", "git", "bash"],
    tone: "flexible",
    outputFormat: "markdown",
    errorHandling: "Flag uncertain observations as suggestions rather than requirements. Distinguish between blocking issues and nitpicks.",
    context: "Has access to the full repo to understand architecture and conventions. Reviews diffs against the main branch.",
    exampleInput: "Review PR #42: Add user authentication middleware",
    exampleOutput: "## Review Summary\n**Approve with suggestions**\n\n### Blocking\n- JWT secret is hardcoded on line 15\n\n### Suggestions\n- Consider rate limiting on the login endpoint",
  },
  {
    id: "feature-builder",
    name: "Feature Builder",
    icon: "Hammer",
    description: "Builds complete features from natural language descriptions end to end.",
    goal: "Implement a complete feature including all necessary files, tests, and documentation based on a natural language specification.",
    tools: ["file-read", "file-write", "bash", "git", "web-search"],
    tone: "flexible",
    outputFormat: "markdown",
    errorHandling: "If requirements are ambiguous, list assumptions made and proceed. Flag areas where user confirmation would be valuable.",
    context: "Full project access. Understands the tech stack, file structure, and coding conventions from existing code.",
    exampleInput: "Add a dark mode toggle to the settings page that persists the user's preference",
    exampleOutput: "## Implementation Plan\n1. Add ThemeProvider context\n2. Create DarkModeToggle component\n3. Persist to localStorage\n4. Update tailwind config...",
  },
  {
    id: "test-writer",
    name: "Test Writer",
    icon: "FlaskConical",
    description: "Generates comprehensive test suites for existing code.",
    goal: "Write thorough unit and integration tests that cover happy paths, edge cases, and error scenarios for the specified code.",
    tools: ["file-read", "file-write", "bash"],
    tone: "strict",
    outputFormat: "plain",
    errorHandling: "If the code under test has side effects or external dependencies, create appropriate mocks and document the mocking strategy.",
    context: "Reads existing test files to match the project's testing framework and conventions (Jest, Vitest, pytest, etc.).",
    exampleInput: "Write tests for the UserService class in src/services/user.ts",
    exampleOutput: "// user.test.ts\ndescribe('UserService', () => {\n  describe('createUser', () => {\n    it('should create a user with valid data', ...)\n    it('should throw on duplicate email', ...)\n  })\n})",
  },
  {
    id: "docs-generator",
    name: "Documentation Generator",
    icon: "FileText",
    description: "Produces clear, structured documentation from code analysis.",
    goal: "Generate comprehensive documentation including API references, usage guides, and architecture overviews by analyzing the codebase.",
    tools: ["file-read", "bash", "git"],
    tone: "flexible",
    outputFormat: "markdown",
    errorHandling: "If code intent is unclear, document the observable behavior and mark unclear sections with TODO annotations for human review.",
    context: "Reads all source files, existing docs, README, and package manifests to understand the project holistically.",
    exampleInput: "Generate API documentation for all endpoints in src/routes/",
    exampleOutput: "# API Reference\n\n## POST /api/users\nCreates a new user account.\n\n**Request Body:**\n```json\n{ \"email\": \"string\", \"name\": \"string\" }\n```",
  },
  {
    id: "mobile-dev",
    name: "Mobile Dev Agent",
    icon: "Smartphone",
    description: "Specialized in React Native and mobile-first development patterns.",
    goal: "Build and modify mobile application features with a focus on performance, platform-specific behavior, and responsive design.",
    tools: ["file-read", "file-write", "bash", "web-search"],
    tone: "flexible",
    outputFormat: "markdown",
    errorHandling: "Handle platform differences (iOS/Android) explicitly. Provide fallbacks for features not available on all platforms.",
    context: "Understands React Native, Expo, platform-specific APIs, and mobile UX patterns. Considers device constraints like battery and network.",
    exampleInput: "Add pull-to-refresh to the feed screen with haptic feedback",
    exampleOutput: "## Implementation\n- Use RefreshControl component\n- Add expo-haptics for tactile feedback\n- Implement optimistic UI update pattern...",
  },
];
