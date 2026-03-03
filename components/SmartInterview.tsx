"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageSquare,
  HelpCircle,
  Layers,
  Server,
  Monitor,
  Rocket,
  ShieldCheck,
  TestTube2,
  Puzzle,
  X,
} from "lucide-react";

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  why: string;
  options: { label: string; description: string; visual?: string }[];
  allowCustom: boolean;
  multiSelect?: boolean;
}

interface SmartInterviewProps {
  questions: InterviewQuestion[];
  onComplete: (answers: Record<string, string>) => void;
  completing: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Architecture: Layers,
  "Tech Stack": Monitor,
  Backend: Server,
  Frontend: Monitor,
  DevOps: Rocket,
  Quality: TestTube2,
  Security: ShieldCheck,
  Features: Puzzle,
};

// Categories that should default to multi-select even if the LLM doesn't flag it
const MULTI_SELECT_CATEGORIES = ["Security", "Features", "Quality"];

export default function SmartInterview({
  questions,
  onComplete,
  completing,
}: SmartInterviewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const currentQuestion = questions[currentStep];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  const isMultiSelect = (q: InterviewQuestion) =>
    q.multiSelect === true || MULTI_SELECT_CATEGORIES.includes(q.category);

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    // Auto-advance for single-select only
    const q = questions.find((x) => x.id === questionId);
    if (q && !isMultiSelect(q) && currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const toggleMultiAnswer = (questionId: string, label: string) => {
    setMultiAnswers((prev) => {
      const current = prev[questionId] ?? [];
      const next = current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label];
      // Also sync to answers as comma-separated string
      const joined = next.join(", ");
      if (next.length > 0) {
        setAnswers((a) => ({ ...a, [questionId]: joined }));
      } else {
        setAnswers((a) => {
          const copy = { ...a };
          delete copy[questionId];
          return copy;
        });
      }
      return { ...prev, [questionId]: next };
    });
  };

  const selectCustom = (questionId: string) => {
    const custom = customInputs[questionId]?.trim();
    if (!custom) return;
    const q = questions.find((x) => x.id === questionId);
    if (q && isMultiSelect(q)) {
      toggleMultiAnswer(questionId, custom);
      setCustomInputs((prev) => ({ ...prev, [questionId]: "" }));
    } else {
      selectAnswer(questionId, custom);
    }
  };

  const handleComplete = () => {
    const qaMap: Record<string, string> = {};
    for (const q of questions) {
      if (answers[q.id]) {
        qaMap[q.question] = answers[q.id];
      }
    }
    onComplete(qaMap);
  };

  const CategoryIcon = CATEGORY_ICONS[currentQuestion?.category] ?? HelpCircle;
  const currentIsMulti = currentQuestion ? isMultiSelect(currentQuestion) : false;
  const currentMultiSelections = currentQuestion
    ? (multiAnswers[currentQuestion.id] ?? [])
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-cyan-400 shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Smart Configuration
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 w-2 rounded-full transition-all cursor-pointer ${
                  i === currentStep
                    ? "bg-cyan-400 w-4"
                    : answers[questions[i].id]
                      ? "bg-emerald-500"
                      : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {answeredCount}/{questions.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {/* Question Header */}
          <div className="border-b border-white/[0.04] px-4 py-3 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400 mt-0.5">
              <CategoryIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold">
                  {currentQuestion.category}
                </span>
                <span className="text-[10px] text-zinc-600">
                  Question {currentStep + 1} of {questions.length}
                </span>
                {currentIsMulti && (
                  <span className="text-[10px] rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-cyan-400">
                    Select multiple
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm sm:text-base font-medium text-white">
                {currentQuestion.question}
              </p>
              <p className="mt-1 text-xs text-zinc-500 flex items-start gap-1">
                <HelpCircle className="h-3 w-3 shrink-0 mt-0.5" />
                {currentQuestion.why}
              </p>
            </div>
          </div>

          {/* Multi-select pills */}
          {currentIsMulti && currentMultiSelections.length > 0 && (
            <div className="px-4 pt-3 flex flex-wrap gap-1.5">
              {currentMultiSelections.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 text-xs text-cyan-300"
                >
                  {label}
                  <button
                    onClick={() => toggleMultiAnswer(currentQuestion.id, label)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Options */}
          <div className="max-h-[450px] overflow-y-auto">
            <div className="p-3 space-y-2">
              {currentQuestion.options.map((option, i) => {
                const isSelected = currentIsMulti
                  ? currentMultiSelections.includes(option.label)
                  : answers[currentQuestion.id] === option.label;
                return (
                  <button
                    key={i}
                    onClick={() =>
                      currentIsMulti
                        ? toggleMultiAnswer(currentQuestion.id, option.label)
                        : selectAnswer(currentQuestion.id, option.label)
                    }
                    className={`w-full rounded-lg border p-3 sm:p-4 text-left transition-all ${
                      isSelected
                        ? "border-cyan-500/50 bg-cyan-500/10"
                        : "border-white/[0.06] bg-white/[0.01] hover:border-cyan-500/20 hover:bg-cyan-500/[0.03]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-${currentIsMulti ? "md" : "full"} border transition-colors ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-500"
                            : "border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm font-medium ${isSelected ? "text-cyan-300" : "text-zinc-200"}`}
                        >
                          {option.label}
                        </div>
                        <div className="mt-0.5 text-xs text-zinc-500 leading-relaxed">
                          {option.description}
                        </div>
                        {option.visual && (
                          <pre className={`mt-2 rounded-md border p-2.5 text-[10px] sm:text-xs font-mono leading-relaxed whitespace-pre-wrap ${
                            isSelected
                              ? "bg-cyan-950/50 border-cyan-500/20 text-cyan-300/80"
                              : "bg-black/30 border-white/[0.04] text-zinc-500"
                          }`}>
                            {option.visual}
                          </pre>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Custom answer */}
              {currentQuestion.allowCustom && (
                <div
                  className={`rounded-lg border p-3 sm:p-4 transition-all ${
                    !currentIsMulti &&
                    answers[currentQuestion.id] &&
                    !currentQuestion.options.some(
                      (o) => o.label === answers[currentQuestion.id]
                    )
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-white/[0.06] bg-white/[0.01]"
                  }`}
                >
                  <div className="text-xs text-zinc-500 mb-2">
                    {currentIsMulti ? "Add your own:" : "Or type your own:"}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInputs[currentQuestion.id] ?? ""}
                      onChange={(e) =>
                        setCustomInputs((prev) => ({
                          ...prev,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                      placeholder="Your answer..."
                      className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-cyan-500/50 min-w-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          selectCustom(currentQuestion.id);
                      }}
                    />
                    <button
                      onClick={() => selectCustom(currentQuestion.id)}
                      disabled={!customInputs[currentQuestion.id]?.trim()}
                      className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors disabled:opacity-40"
                    >
                      {currentIsMulti ? "Add" : "Set"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-white/[0.04] px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
            >
              Previous
            </button>
            {currentStep < questions.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Answered summary chips */}
      {answeredCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {questions.map((q) => {
            if (!answers[q.id]) return null;
            return (
              <button
                key={q.id}
                onClick={() =>
                  setCurrentStep(questions.findIndex((x) => x.id === q.id))
                }
                className="flex items-center gap-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:border-white/10 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span className="text-zinc-500">{q.category}:</span>
                <span className="text-zinc-300 max-w-[150px] truncate">
                  {answers[q.id]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={!allAnswered || completing}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {completing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Building your agent configuration...
          </>
        ) : allAnswered ? (
          <>
            <Rocket className="h-4 w-4" />
            Build Agent Configuration
          </>
        ) : (
          <>
            Answer all questions to continue ({answeredCount}/{questions.length})
          </>
        )}
      </button>
    </div>
  );
}
