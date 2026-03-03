"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  MessageSquare,
  FastForward,
  WandSparkles,
} from "lucide-react";

interface PromptAnalysis {
  score: number;
  suggestions: { label: string; question: string }[];
  strengths: string[];
}

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalysis: (analysis: PromptAnalysis | null) => void;
  onStartInterview: () => void;
  onQuickAutoFill: () => void;
  loadingInterview: boolean;
}

export default function PromptInput({
  value,
  onChange,
  onAnalysis,
  onStartInterview,
  onQuickAutoFill,
  loadingInterview,
}: PromptInputProps) {
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const analyze = useCallback(
    async (text: string) => {
      if (text.trim().length < 20) {
        setAnalysis(null);
        onAnalysis(null);
        return;
      }

      setAnalyzing(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: text }),
        });
        if (res.ok) {
          const data: PromptAnalysis = await res.json();
          setAnalysis(data);
          onAnalysis(data);
        }
      } catch {
        // silently fail
      } finally {
        setAnalyzing(false);
      }
    },
    [onAnalysis]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyze(value), 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, analyze]);

  const handleChipClick = (question: string) => {
    setActiveQuestion(activeQuestion === question ? null : question);
  };

  const handleImprove = useCallback(async () => {
    if (value.trim().length < 10 || improving) return;
    setImproving(true);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: value }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.improved) {
          onChange(data.improved);
        }
      }
    } catch {
      // silently fail
    } finally {
      setImproving(false);
    }
  }, [value, improving, onChange]);

  const handleFollowUp = (answer: string) => {
    if (answer.trim()) {
      onChange(value + "\n" + answer);
    }
    setActiveQuestion(null);
    textareaRef.current?.focus();
  };

  const hasEnoughText = value.trim().length >= 10;
  const isBusy = improving || loadingInterview;

  const scoreColor =
    (analysis?.score ?? 0) >= 70
      ? "text-emerald-400"
      : (analysis?.score ?? 0) >= 40
        ? "text-amber-400"
        : "text-red-400";

  const scoreBarColor =
    (analysis?.score ?? 0) >= 70
      ? "bg-emerald-500"
      : (analysis?.score ?? 0) >= 40
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400 shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Describe Your Agent
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {analyzing && (
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analyzing...
            </div>
          )}
          {analysis && !analyzing && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {analysis.score >= 70 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
                <span className={`text-sm font-mono font-bold ${scoreColor}`}>
                  {analysis.score}%
                </span>
              </div>
              <span className="text-xs text-zinc-500">Health Score</span>
            </div>
          )}
        </div>
      </div>

      {/* Score Bar */}
      {analysis && !analyzing && (
        <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${scoreBarColor}`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Tell us what you want to build — we'll handle the technical details.\n\nExamples:\n• "I'm building an e-commerce store and need an agent to help"\n• "I want an agent that reviews my React code for bugs"\n• "Help me build a REST API for a todo app"`}
          className="min-h-[140px] sm:min-h-[200px] resize-none border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-600 font-mono text-xs sm:text-sm leading-relaxed focus-visible:ring-blue-500/50 focus-visible:border-blue-500/30"
        />
        {value.length > 0 && (
          <span className="absolute bottom-3 right-3 text-xs text-zinc-600 font-mono">
            {value.length} chars
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Primary: Smart Configure */}
        <button
          onClick={onStartInterview}
          disabled={!hasEnoughText || isBusy}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loadingInterview ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your project...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              Configure My Agent — Smart Interview
            </>
          )}
        </button>

        {/* Secondary row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleImprove}
            disabled={!hasEnoughText || isBusy}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-violet-500/20 bg-violet-600/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-violet-300 transition-all hover:bg-violet-600/20 hover:border-violet-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {improving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <WandSparkles className="h-3.5 w-3.5" />
                Improve Description
              </>
            )}
          </button>
          <button
            onClick={onQuickAutoFill}
            disabled={!hasEnoughText || isBusy}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FastForward className="h-3.5 w-3.5" />
            Skip Interview — Quick Fill
          </button>
        </div>

        {!hasEnoughText && (
          <p className="text-xs text-zinc-600 text-center">
            Describe your project to get started
          </p>
        )}
      </div>

      {/* Strengths */}
      {analysis && analysis.strengths.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {analysis.strengths.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400"
            >
              <CheckCircle2 className="h-3 w-3" />
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Suggestion Chips */}
      {analysis && analysis.suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Zap className="h-3 w-3" />
            Suggestions to improve your prompt:
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.suggestions.map((s, i) => (
              <Badge
                key={i}
                variant="outline"
                className={`cursor-pointer transition-all border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 ${
                  activeQuestion === s.question
                    ? "bg-blue-500/15 border-blue-500/50"
                    : ""
                }`}
                onClick={() => handleChipClick(s.question)}
              >
                + {s.label}
              </Badge>
            ))}
          </div>

          {activeQuestion && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <p className="text-sm text-blue-300">{activeQuestion}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500/50 min-w-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFollowUp(e.currentTarget.value);
                    }
                  }}
                  autoFocus
                />
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                  onClick={(e) => {
                    const input = (e.currentTarget as HTMLElement)
                      .previousElementSibling as HTMLInputElement;
                    handleFollowUp(input?.value ?? "");
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
