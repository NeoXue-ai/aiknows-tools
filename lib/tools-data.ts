import toolsDataRaw from "@/data/tools.json";

// Handle both old format (array) and new format (object with tools array)
export const toolsData = Array.isArray(toolsDataRaw) ? toolsDataRaw : (toolsDataRaw as any).tools || [];
