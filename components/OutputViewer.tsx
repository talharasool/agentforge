"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy,
  Check,
  Download,
  FileText,
  Terminal,
  Wrench,
  Play,
} from "lucide-react";
import JSZip from "jszip";

interface GeneratedAgent {
  claudeMd: string;
  systemPrompt: string;
  toolsList: string;
  exampleUsage: string;
}

interface OutputViewerProps {
  output: GeneratedAgent;
}

const TAB_CONFIG = [
  {
    id: "claudeMd",
    label: "CLAUDE.md",
    icon: FileText,
    filename: "CLAUDE.md",
  },
  {
    id: "systemPrompt",
    label: "System Prompt",
    icon: Terminal,
    filename: "system-prompt.md",
  },
  {
    id: "toolsList",
    label: "Tools",
    icon: Wrench,
    filename: "tools.md",
  },
  {
    id: "exampleUsage",
    label: "Usage",
    icon: Play,
    filename: "example-usage.md",
  },
] as const;

export default function OutputViewer({ output }: OutputViewerProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Safely convert any value to a displayable string
  const toStr = (v: unknown): string => {
    if (typeof v === "string") return v;
    if (v == null) return "";
    return JSON.stringify(v, null, 2);
  };

  const copyToClipboard = async (text: string, tabId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    for (const tab of TAB_CONFIG) {
      zip.file(tab.filename, toStr(output[tab.id]));
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-config.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Generated Agent</h2>
        <button
          onClick={downloadZip}
          className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Download className="h-3.5 w-3.5" />
          Download ZIP
        </button>
      </div>

      <Tabs defaultValue="claudeMd" className="w-full">
        <TabsList className="w-full justify-start bg-white/[0.03] border border-white/[0.06] p-1 h-auto flex-wrap gap-1">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-400 data-[state=active]:shadow-none"
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TAB_CONFIG.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-3">
            <div className="relative rounded-lg border border-white/[0.06] bg-[#0d0d14]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
                <span className="text-xs font-mono text-zinc-500">
                  {tab.filename}
                </span>
                <button
                  onClick={() => copyToClipboard(toStr(output[tab.id]), tab.id)}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:text-white hover:bg-white/[0.05]"
                >
                  {copiedTab === tab.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Content */}
              <ScrollArea className="h-[250px] sm:h-[400px]">
                <pre className="p-4 text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {toStr(output[tab.id])}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
