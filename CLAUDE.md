Build a full-stack web application called "AgentForge" — a tool that helps developers build Claude Code agents without needing to know how to write prompts.

## Core Features

### Feature 1: Prompt Intelligence Layer (Smart Input)
- A large text area where the user describes what they want their agent to do in plain English
- As the user types, an AI-powered analyzer detects what's missing from their description (context, tools, output format, constraints, tone)
- Show a live "Prompt Health Score" (0–100%) that updates in real time
- Display smart suggestion chips below the textarea like: "Add output format", "Specify target language", "Define error handling"
- When user clicks a chip, it asks a focused follow-up question to gather that info

### Feature 2: Agent Builder UI (Visual Constructor)
After the user fills in their description, show a visual step-by-step builder with these sections:
1. **Goal** — What should the agent accomplish?
2. **Tools** — Checkboxes for: file read/write, bash commands, web search, git, API calls
3. **Constraints** — Tone (strict/flexible), output format (JSON/markdown/plain), error handling behavior
4. **Context** — Text field for codebase info, tech stack, team conventions
5. **Example Input/Output** — Optional but recommended section

### Feature 3: Agent Output Generator
Once all sections are filled:
- A "Generate Agent" button calls the Claude API
- Claude generates a complete, ready-to-use Claude Code agent setup including:
  - CLAUDE.md file content
  - System prompt
  - Recommended tools list
  - Example usage commands
- Show output in a tabbed code viewer (one tab per file)
- Each tab has a "Copy" button
- A "Download All as ZIP" button

### Feature 4: Template Library
- Sidebar with pre-built agent templates: Bug Fixer, Code Reviewer, Feature Builder, Test Writer, Documentation Generator, Mobile Dev Agent
- Each template pre-fills the builder with sensible defaults
- Users can customize from the template

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- Claude API (claude-sonnet-4-20250514) for generation and prompt analysis
- No database needed for MVP — use local state

## Design Direction
Dark theme. Premium developer tool aesthetic. Think Linear meets Vercel dashboard. 
- Background: deep #0a0a0f with subtle grid pattern
- Accent: electric blue #3b82f6 with cyan highlights
- Clean monospace font for code sections (JetBrains Mono)
- Sharp corners, thin borders, glass-morphism cards
- Smooth transitions on all interactive elements
- Progress indicator as user completes each section

## API Integration
Use the Anthropic API for two purposes:
1. **Real-time prompt analysis** — Debounced call every 1.5s as user types, analyzes what's missing and returns structured suggestions
2. **Agent generation** — Full generation call when user clicks "Generate Agent"

Both calls should show elegant loading states.

## File Structure
/app
  /page.tsx — Main app layout with sidebar + main content
  /api/analyze/route.ts — Endpoint for prompt analysis
  /api/generate/route.ts — Endpoint for agent generation
/components
  /PromptInput.tsx — Smart textarea with health score
  /AgentBuilder.tsx — Visual section-by-section builder  
  /OutputViewer.tsx — Tabbed code output
  /TemplateSidebar.tsx — Template library
/lib
  /claude.ts — Claude API client
  /templates.ts — Pre-built agent templates

## Important Notes
- Mobile responsive
- All API keys should be read from environment variables (ANTHROPIC_API_KEY)
- Add proper error handling and loading states everywhere
- Include a README.md with setup instructions
- The app should feel like a premium SaaS product, not a side project
