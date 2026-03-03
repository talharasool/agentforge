"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Target,
  Wrench,
  Shield,
  BookOpen,
  FileCode,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";

const TOOL_OPTIONS = [
  { id: "file-read", label: "File Read", desc: "Read files from the codebase" },
  {
    id: "file-write",
    label: "File Write",
    desc: "Create and modify files",
  },
  { id: "bash", label: "Bash Commands", desc: "Execute shell commands" },
  { id: "web-search", label: "Web Search", desc: "Search the internet" },
  { id: "git", label: "Git", desc: "Version control operations" },
  { id: "api-calls", label: "API Calls", desc: "Make HTTP requests" },
];

export interface BuilderData {
  goal: string;
  tools: string[];
  tone: "strict" | "flexible";
  outputFormat: "json" | "markdown" | "plain";
  errorHandling: string;
  context: string;
  exampleInput: string;
  exampleOutput: string;
}

interface AgentBuilderProps {
  data: BuilderData;
  onChange: (data: BuilderData) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function AgentBuilder({
  data,
  onChange,
  onGenerate,
  generating,
}: AgentBuilderProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["goal", "tools", "constraints", "context", "examples"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const update = (partial: Partial<BuilderData>) => {
    onChange({ ...data, ...partial });
  };

  const toggleTool = (toolId: string) => {
    const tools = data.tools.includes(toolId)
      ? data.tools.filter((t) => t !== toolId)
      : [...data.tools, toolId];
    update({ tools });
  };

  const str = (v: unknown) => (typeof v === "string" ? v : String(v ?? ""));

  const completedSections = [
    str(data.goal).trim().length > 0,
    data.tools.length > 0,
    true, // constraints always have defaults
    str(data.context).trim().length > 0,
    str(data.exampleInput).trim().length > 0 || str(data.exampleOutput).trim().length > 0,
  ].filter(Boolean).length;

  const sections = [
    {
      id: "goal",
      icon: Target,
      title: "Goal",
      subtitle: "What should the agent accomplish?",
      complete: str(data.goal).trim().length > 0,
    },
    {
      id: "tools",
      icon: Wrench,
      title: "Tools",
      subtitle: "What capabilities does it need?",
      complete: data.tools.length > 0,
    },
    {
      id: "constraints",
      icon: Shield,
      title: "Constraints",
      subtitle: "Tone, format, and error behavior",
      complete: true,
    },
    {
      id: "context",
      icon: BookOpen,
      title: "Context",
      subtitle: "Codebase info and conventions",
      complete: str(data.context).trim().length > 0,
    },
    {
      id: "examples",
      icon: FileCode,
      title: "Examples",
      subtitle: "Example input/output (recommended)",
      complete:
        str(data.exampleInput).trim().length > 0 ||
        str(data.exampleOutput).trim().length > 0,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base sm:text-lg font-semibold text-white">Agent Builder</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {sections.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 w-4 sm:w-6 rounded-full transition-colors ${
                  s.complete ? "bg-blue-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {completedSections}/{sections.length}
          </span>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const expanded = expandedSections.has(section.id);
        const Icon = section.icon;

        return (
          <div
            key={section.id}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-md ${
                  section.complete
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-white/5 text-zinc-500"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-zinc-200">
                  {section.title}
                </div>
                <div className="text-xs text-zinc-500">{section.subtitle}</div>
              </div>
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              )}
            </button>

            {expanded && (
              <div className="border-t border-white/[0.04] px-4 py-4">
                {section.id === "goal" && (
                  <Textarea
                    value={data.goal}
                    onChange={(e) => update({ goal: e.target.value })}
                    placeholder="e.g., Review TypeScript code for type safety issues and suggest improvements..."
                    className="min-h-[100px] resize-none border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-600 text-sm"
                  />
                )}

                {section.id === "tools" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TOOL_OPTIONS.map((tool) => (
                      <label
                        key={tool.id}
                        className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-all ${
                          data.tools.includes(tool.id)
                            ? "border-blue-500/40 bg-blue-500/5"
                            : "border-white/[0.06] bg-white/[0.01] hover:border-white/10"
                        }`}
                      >
                        <Checkbox
                          checked={data.tools.includes(tool.id)}
                          onCheckedChange={() => toggleTool(tool.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="text-sm font-medium text-zinc-200">
                            {tool.label}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {tool.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {section.id === "constraints" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                        Tone
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {(["strict", "flexible"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => update({ tone: t })}
                            className={`rounded-md border px-4 py-2 text-sm capitalize transition-all ${
                              data.tone === t
                                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                                : "border-white/[0.06] text-zinc-400 hover:border-white/10"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                        Output Format
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {(["json", "markdown", "plain"] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => update({ outputFormat: f })}
                            className={`rounded-md border px-4 py-2 text-sm uppercase transition-all ${
                              data.outputFormat === f
                                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                                : "border-white/[0.06] text-zinc-400 hover:border-white/10"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                        Error Handling
                      </Label>
                      <Textarea
                        value={data.errorHandling}
                        onChange={(e) =>
                          update({ errorHandling: e.target.value })
                        }
                        placeholder="How should the agent handle errors, edge cases, and uncertain situations?"
                        className="min-h-[80px] resize-none border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-600 text-sm"
                      />
                    </div>
                  </div>
                )}

                {section.id === "context" && (
                  <Textarea
                    value={data.context}
                    onChange={(e) => update({ context: e.target.value })}
                    placeholder="Describe the tech stack, team conventions, project structure, or any relevant codebase details..."
                    className="min-h-[100px] resize-none border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-600 text-sm"
                  />
                )}

                {section.id === "examples" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                        Example Input
                      </Label>
                      <Textarea
                        value={data.exampleInput}
                        onChange={(e) =>
                          update({ exampleInput: e.target.value })
                        }
                        placeholder="What might a user ask this agent to do?"
                        className="min-h-[80px] resize-none border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-600 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-400 uppercase tracking-wider">
                        Example Output
                      </Label>
                      <Textarea
                        value={data.exampleOutput}
                        onChange={(e) =>
                          update({ exampleOutput: e.target.value })
                        }
                        placeholder="What should the agent's response look like?"
                        className="min-h-[80px] resize-none border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-600 text-sm font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={generating || !data.goal.trim()}
        className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-blue-500/20 disabled:hover:brightness-100"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating Agent...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Agent
          </>
        )}
      </button>
    </div>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
