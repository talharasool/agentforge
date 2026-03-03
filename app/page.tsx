"use client";

import { useState, useCallback, useRef } from "react";
import PromptInput from "@/components/PromptInput";
import SmartInterview from "@/components/SmartInterview";
import AgentBuilder, { type BuilderData } from "@/components/AgentBuilder";
import OutputViewer from "@/components/OutputViewer";
import TemplateSidebar from "@/components/TemplateSidebar";
import type { AgentTemplate } from "@/lib/templates";
import { Separator } from "@/components/ui/separator";
import { Zap, Menu, X } from "lucide-react";

interface GeneratedAgent {
  claudeMd: string;
  systemPrompt: string;
  toolsList: string;
  exampleUsage: string;
}

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  why: string;
  options: { label: string; description: string }[];
  allowCustom: boolean;
  multiSelect?: boolean;
}

const DEFAULT_BUILDER: BuilderData = {
  goal: "",
  tools: [],
  tone: "flexible",
  outputFormat: "markdown",
  errorHandling: "",
  context: "",
  exampleInput: "",
  exampleOutput: "",
};

type AppStep = "describe" | "interview" | "builder" | "output";

// Safely coerce API values to strings (LLMs sometimes return objects/arrays)
function s(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return JSON.stringify(v);
}

function toBuilderData(data: Record<string, unknown>): BuilderData {
  return {
    goal: s(data.goal),
    tools: Array.isArray(data.tools) ? data.tools.map(String) : [],
    tone: data.tone === "strict" ? "strict" : "flexible",
    outputFormat: (["json", "markdown", "plain"] as const).includes(data.outputFormat as "json" | "markdown" | "plain")
      ? (data.outputFormat as "json" | "markdown" | "plain")
      : "markdown",
    errorHandling: s(data.errorHandling),
    context: s(data.context),
    exampleInput: s(data.exampleInput),
    exampleOutput: s(data.exampleOutput),
  };
}

export default function Home() {
  const [description, setDescription] = useState("");
  const [builderData, setBuilderData] = useState<BuilderData>(DEFAULT_BUILDER);
  const [generatedOutput, setGeneratedOutput] =
    useState<GeneratedAgent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interview state
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [buildingFromInterview, setBuildingFromInterview] = useState(false);
  const [currentStep, setCurrentStep] = useState<AppStep>("describe");

  const interviewRef = useRef<HTMLElement>(null);
  const builderRef = useRef<HTMLElement>(null);

  const handleAnalysis = useCallback(
    (analysis: { score: number; suggestions: { label: string; question: string }[]; strengths: string[] } | null) => {
      void analysis;
    },
    []
  );

  const handleTemplateSelect = useCallback((template: AgentTemplate) => {
    setDescription(template.description);
    setBuilderData({
      goal: template.goal,
      tools: template.tools,
      tone: template.tone,
      outputFormat: template.outputFormat,
      errorHandling: template.errorHandling,
      context: template.context,
      exampleInput: template.exampleInput,
      exampleOutput: template.exampleOutput,
    });
    setInterviewQuestions([]);
    setGeneratedOutput(null);
    setGenerateError(null);
    setCurrentStep("builder");
    setMobileMenuOpen(false);
    setTimeout(() => {
      builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleNewAgent = useCallback(() => {
    setDescription("");
    setBuilderData(DEFAULT_BUILDER);
    setInterviewQuestions([]);
    setGeneratedOutput(null);
    setGenerateError(null);
    setCurrentStep("describe");
    setMobileMenuOpen(false);
  }, []);

  // Start the smart interview
  const handleStartInterview = useCallback(async () => {
    if (description.trim().length < 10 || loadingInterview) return;
    setLoadingInterview(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions?.length > 0) {
          setInterviewQuestions(data.questions);
          setCurrentStep("interview");
          setTimeout(() => {
            interviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }
    } catch {
      // fallback: skip interview, go directly to auto-fill
      handleQuickAutoFill();
    } finally {
      setLoadingInterview(false);
    }
  }, [description, loadingInterview]);

  // Quick auto-fill (skip interview)
  const handleQuickAutoFill = useCallback(async () => {
    if (description.trim().length < 10) return;
    setLoadingInterview(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        const data = await res.json();
        setBuilderData(toBuilderData(data));
        setCurrentStep("builder");
        setTimeout(() => {
          builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingInterview(false);
    }
  }, [description]);

  // Interview complete → build from answers
  const handleInterviewComplete = useCallback(
    async (answers: Record<string, string>) => {
      setBuildingFromInterview(true);
      try {
        const res = await fetch("/api/build-from-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, answers }),
        });
        if (res.ok) {
          const data = await res.json();
          setBuilderData(toBuilderData(data));
          setCurrentStep("builder");
          setTimeout(() => {
            builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      } catch {
        // silently fail
      } finally {
        setBuildingFromInterview(false);
      }
    },
    [description]
  );

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(builderData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }
      const data: GeneratedAgent = await res.json();
      setGeneratedOutput(data);
      setCurrentStep("output");
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setGenerating(false);
    }
  }, [builderData]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <TemplateSidebar
          onSelect={handleTemplateSelect}
          onNewAgent={handleNewAgent}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((p) => !p)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 h-full w-72 max-w-[80vw]">
            <TemplateSidebar
              onSelect={handleTemplateSelect}
              onNewAgent={handleNewAgent}
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a12]/80 backdrop-blur-sm px-4 sm:px-6 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="md:hidden rounded-md p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                AgentForge
              </h1>
              <p className="hidden sm:block text-[11px] text-zinc-500">
                Build Claude Code agents without writing prompts
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {(["describe", "interview", "builder", "output"] as const).map(
              (step, i) => {
                const labels = ["Describe", "Configure", "Review", "Output"];
                const isActive = step === currentStep;
                const stepIndex = ["describe", "interview", "builder", "output"].indexOf(currentStep);
                const isPast = i < stepIndex;
                return (
                  <div key={step} className="hidden sm:flex items-center gap-2">
                    {i > 0 && (
                      <div
                        className={`h-px w-4 ${isPast ? "bg-cyan-500" : "bg-white/10"}`}
                      />
                    )}
                    <div
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        isActive
                          ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                          : isPast
                            ? "text-emerald-400"
                            : "text-zinc-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive
                            ? "bg-cyan-400"
                            : isPast
                              ? "bg-emerald-500"
                              : "bg-white/10"
                        }`}
                      />
                      {labels[i]}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
            {/* Step 1: Describe */}
            <section className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3 sm:p-6 backdrop-blur-sm">
              <PromptInput
                value={description}
                onChange={setDescription}
                onAnalysis={handleAnalysis}
                onStartInterview={handleStartInterview}
                onQuickAutoFill={handleQuickAutoFill}
                loadingInterview={loadingInterview}
              />
            </section>

            {/* Step 2: Smart Interview */}
            {currentStep !== "describe" && interviewQuestions.length > 0 && (
              <>
                <Separator className="bg-white/[0.04]" />
                <section
                  ref={interviewRef}
                  className="rounded-xl border border-cyan-500/10 bg-white/[0.01] p-3 sm:p-6 backdrop-blur-sm"
                >
                  <SmartInterview
                    questions={interviewQuestions}
                    onComplete={handleInterviewComplete}
                    completing={buildingFromInterview}
                  />
                </section>
              </>
            )}

            {/* Step 3: Builder (Review & Tweak) */}
            {(currentStep === "builder" || currentStep === "output") && (
              <>
                <Separator className="bg-white/[0.04]" />
                <section
                  ref={builderRef}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3 sm:p-6 backdrop-blur-sm"
                >
                  <AgentBuilder
                    data={builderData}
                    onChange={setBuilderData}
                    onGenerate={handleGenerate}
                    generating={generating}
                  />
                </section>
              </>
            )}

            {/* Error */}
            {generateError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 sm:p-4 text-sm text-red-400">
                {generateError}
              </div>
            )}

            {/* Step 4: Output */}
            {generatedOutput && currentStep === "output" && (
              <>
                <Separator className="bg-white/[0.04]" />
                <section className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3 sm:p-6 backdrop-blur-sm">
                  <OutputViewer output={generatedOutput} />
                </section>
              </>
            )}

            <div className="h-8" />
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-white/[0.06] px-4 py-1.5 text-center">
          <p className="text-[11px] text-zinc-500">
            Made with <span className="text-red-400">&#9829;</span> by Talha Rasool
          </p>
        </footer>
      </div>
    </div>
  );
}
