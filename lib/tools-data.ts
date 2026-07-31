import toolsDataRaw from "@/data/tools.json";

type ToolsSnapshot = {
  version?: string;
  generatedAt?: string;
  totalTools?: number;
  sources?: string[];
  tools: unknown[];
};

export const toolsSnapshot: ToolsSnapshot = Array.isArray(toolsDataRaw)
  ? { tools: toolsDataRaw }
  : (toolsDataRaw as ToolsSnapshot);

export const toolsData = toolsSnapshot.tools;
