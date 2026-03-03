"use client";

import { templates, type AgentTemplate } from "@/lib/templates";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bug,
  GitPullRequest,
  Hammer,
  FlaskConical,
  FileText,
  Smartphone,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Bug,
  GitPullRequest,
  Hammer,
  FlaskConical,
  FileText,
  Smartphone,
};

interface TemplateSidebarProps {
  onSelect: (template: AgentTemplate) => void;
  onNewAgent: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function TemplateSidebar({
  onSelect,
  onNewAgent,
  collapsed,
  onToggle,
}: TemplateSidebarProps) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center border-r border-white/[0.06] bg-[#0a0a12] py-4 w-14">
        <button
          onClick={onToggle}
          className="mb-4 rounded-md p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={onNewAgent}
          className="mb-3 rounded-md p-2 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          title="Create from Scratch"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px w-6 bg-white/[0.06] mb-3" />
        <div className="flex flex-col gap-2">
          {templates.map((t) => {
            const Icon = ICON_MAP[t.icon] ?? Layers;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                className="rounded-md p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                title={t.name}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-r border-white/[0.06] bg-[#0a0a12] w-72 shrink-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-zinc-200">
            Templates
          </span>
        </div>
        <button
          onClick={onToggle}
          className="rounded-md p-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Create from Scratch */}
      <div className="px-3 pt-3">
        <button
          onClick={onNewAgent}
          className="w-full rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/[0.03] p-3 text-left transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.06] group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-emerald-400">
                Create from Scratch
              </div>
              <div className="mt-0.5 text-xs text-zinc-500">
                Build a brand-new agent from your own description
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="px-3 pt-3 pb-1">
        <span className="text-[10px] uppercase tracking-widest text-zinc-600">
          Or start from a template
        </span>
      </div>

      {/* Template List */}
      <ScrollArea className="flex-1">
        <div className="px-3 pb-3 space-y-2">
          {templates.map((template) => {
            const Icon = ICON_MAP[template.icon] ?? Layers;
            return (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="w-full rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 text-left transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.03] group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-zinc-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {template.name}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
                      {template.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
