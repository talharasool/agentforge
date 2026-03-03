# AgntForge

Build production-ready Claude Code agent configurations in minutes — no prompt engineering required.

AgntForge is an AI-powered tool that lets anyone (even non-technical users) create fully configured Claude Code agents through a smart interview process and visual builder.

## Features

### Core
- **Smart Interview System** — Domain-specific questions with visual ASCII diagrams, multi-select support, and beginner-friendly descriptions. Automatically adapts to your project type (e-commerce, SaaS, mobile, API, etc.)
- **Visual Agent Builder** — Step-by-step builder for Goal, Tools, Constraints, Context, and Examples with progress tracking
- **AI-Powered Generation** — Generates complete, production-ready configurations: CLAUDE.md (80-100 lines), system prompt, tools list, and usage examples
- **Template Library** — 6 pre-built templates: Bug Fixer, Code Reviewer, Feature Builder, Test Writer, Docs Generator, Mobile Dev
- **Download as ZIP** — Export all generated files in one click

### Smart Features
- **Real-time Prompt Analysis** — Live health score (0-100) with intelligent suggestions as you type
- **AI Prompt Improvement** — One-click rewrite to make your description more complete and effective
- **Quick Auto-Fill** — Skip the interview and auto-fill the builder from your description
- **Multi-Select Questions** — Pick multiple options where it makes sense (e.g., JWT + Social Login for auth)

### UX
- **4-Step Wizard Flow** — Describe → Configure → Review → Output
- **Fully Responsive** — Mobile-first design with hamburger menu sidebar
- **Dark Theme** — Premium Linear/Vercel-inspired aesthetic
- **Create from Scratch** — Start fresh or pick from templates

### SEO & Production
- **Full Meta Tags** — Open Graph, Twitter Cards, structured data (JSON-LD)
- **Search Engine Ready** — Auto-generated sitemap.xml, robots.txt
- **Bing & Google Verification** — Ready via environment variables
- **Canonical URLs** — Proper SEO with canonical and alternate links

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com/) (free tier available)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/TalhaRasool/agentforge.git
   cd agentforge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```env
   GROQ_API_KEY=your-groq-api-key
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   # Optional: Search engine verification
   NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-code
   NEXT_PUBLIC_BING_VERIFICATION=your-bing-code
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 16** — App Router with Turbopack
- **TypeScript** — Strict mode
- **Tailwind CSS v4** — Utility-first styling
- **shadcn/ui** — Accessible component library (new-york style)
- **Groq SDK** — Llama 3.3 70B Versatile for all AI features
- **JSZip** — Client-side ZIP generation and download

## Project Structure

```
app/
  layout.tsx                      — Root layout with full SEO metadata & JSON-LD
  page.tsx                        — Main 4-step wizard (Describe → Configure → Review → Output)
  globals.css                     — Dark theme styles, custom scrollbars
  sitemap.ts                      — Auto-generated sitemap.xml
  robots.ts                       — Search engine crawl rules
  api/
    analyze/route.ts              — Real-time prompt health scoring
    improve/route.ts              — AI prompt rewriting
    extract/route.ts              — Quick auto-fill from description
    interview/route.ts            — Smart interview question generation
    build-from-interview/route.ts — Convert interview answers to builder config
    generate/route.ts             — Full agent configuration generation
components/
  PromptInput.tsx                 — Smart textarea with health score & action buttons
  SmartInterview.tsx              — Multi-step interview with multi-select & visuals
  AgentBuilder.tsx                — Visual section builder with progress tracking
  OutputViewer.tsx                — Tabbed code viewer with copy & ZIP download
  TemplateSidebar.tsx             — Collapsible template library sidebar
  ui/                             — shadcn/ui components
lib/
  claude.ts                       — Groq/Llama API client (all AI functions)
  templates.ts                    — 6 pre-built agent templates
  utils.ts                        — Utility helpers
public/
  icon.svg                        — App favicon
```

## How It Works

1. **Describe** — Write what kind of agent you want to build
2. **Configure** — Answer smart, domain-specific interview questions (with visual examples)
3. **Review** — Fine-tune the auto-filled builder sections
4. **Generate** — Get a complete agent config: CLAUDE.md, system prompt, tools, and usage examples
5. **Download** — Export everything as a ZIP file

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add `GROQ_API_KEY` to environment variables
4. Deploy

## SEO Setup Guide

After deploying, follow these steps to get indexed by search engines:

### 1. Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your site URL (e.g. `https://agentforge.vercel.app`)
3. Choose **HTML tag** verification method — copy the `content` value
4. Add it to your Vercel environment variables as `NEXT_PUBLIC_GOOGLE_VERIFICATION`
5. Redeploy, then click **Verify** in Search Console
6. Go to **Sitemaps** → submit `https://your-domain.com/sitemap.xml`

### 2. Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site URL
3. Choose **HTML meta tag** verification — copy the `content` value
4. Add it to Vercel env vars as `NEXT_PUBLIC_BING_VERIFICATION`
5. Redeploy, then verify
6. Submit your sitemap: `https://your-domain.com/sitemap.xml`

### 3. Open Graph Image
1. Create a 1200x630px image for social sharing previews
2. Save it as `public/og-image.png`
3. Commit and redeploy — links shared on Twitter, LinkedIn, Facebook will show the image

### 4. Environment Variables for SEO
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code
NEXT_PUBLIC_BING_VERIFICATION=your-bing-verification-code
NEXT_PUBLIC_YANDEX_VERIFICATION=your-yandex-verification-code
```

### What's Already Built-In
- `robots.txt` — allows all crawlers, blocks `/api/` routes
- `sitemap.xml` — auto-generated with correct URLs
- Open Graph & Twitter Card meta tags
- JSON-LD structured data (WebApplication schema)
- Canonical URLs

## Author

Made with love by **Talha Rasool**

## License

MIT
